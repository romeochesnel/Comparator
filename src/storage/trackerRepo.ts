import { getDb } from './db';
import { Tracker, CreateTrackerDto } from '../types';

interface TrackerRow {
  id: number;
  name: string;
  url: string;
  selector: string;
  interval: number;
  active: number;
  js_render: number;
  created_at: string;
}

function toTracker(row: TrackerRow): Tracker {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    selector: row.selector,
    interval: row.interval,
    active: row.active === 1,
    jsRender: row.js_render === 1,
    createdAt: row.created_at,
  };
}

export function findAll(): Tracker[] {
  return (getDb().prepare('SELECT * FROM trackers ORDER BY created_at DESC').all() as TrackerRow[]).map(toTracker);
}

export function findById(id: number): Tracker | undefined {
  const row = getDb().prepare('SELECT * FROM trackers WHERE id = ?').get(id) as TrackerRow | undefined;
  return row ? toTracker(row) : undefined;
}

export function findActive(): Tracker[] {
  return (getDb().prepare('SELECT * FROM trackers WHERE active = 1').all() as TrackerRow[]).map(toTracker);
}

export function create(dto: CreateTrackerDto): Tracker {
  const result = getDb()
    .prepare('INSERT INTO trackers (name, url, selector, interval, js_render) VALUES (?, ?, ?, ?, ?)')
    .run(dto.name, dto.url, dto.selector, dto.interval ?? 60, dto.jsRender ? 1 : 0);
  return findById(result.lastInsertRowid as number)!;
}

export function update(
  id: number,
  fields: Partial<Pick<Tracker, 'name' | 'url' | 'selector' | 'interval' | 'active' | 'jsRender'>>
): Tracker | undefined {
  const tracker = findById(id);
  if (!tracker) return undefined;
  const m = { ...tracker, ...fields };
  getDb()
    .prepare('UPDATE trackers SET name=?, url=?, selector=?, interval=?, active=?, js_render=? WHERE id=?')
    .run(m.name, m.url, m.selector, m.interval, m.active ? 1 : 0, m.jsRender ? 1 : 0, id);
  return findById(id);
}

export function remove(id: number): boolean {
  return getDb().prepare('DELETE FROM trackers WHERE id = ?').run(id).changes > 0;
}
