import { getDb } from './db';
import { HistoryEntry, CheckResult, TrackerStats } from '../types';

interface HistoryRow {
  id: number;
  tracker_id: number;
  value: string | null;
  status_code: number | null;
  error: string | null;
  checked_at: string;
}

function toEntry(row: HistoryRow): HistoryEntry {
  return {
    id: row.id,
    trackerId: row.tracker_id,
    value: row.value,
    statusCode: row.status_code,
    error: row.error,
    checkedAt: row.checked_at,
  };
}

export function findByTrackerId(trackerId: number, limit = 100): HistoryEntry[] {
  return (
    getDb()
      .prepare('SELECT * FROM history WHERE tracker_id = ? ORDER BY checked_at DESC, id DESC LIMIT ?')
      .all(trackerId, limit) as HistoryRow[]
  ).map(toEntry);
}

export function findLatestByTrackerId(trackerId: number): HistoryEntry | undefined {
  const row = getDb()
    .prepare('SELECT * FROM history WHERE tracker_id = ? ORDER BY checked_at DESC, id DESC LIMIT 1')
    .get(trackerId) as HistoryRow | undefined;
  return row ? toEntry(row) : undefined;
}

function parseNum(str: string): number | null {
  const m = str.replace(',', '.').match(/[\d.]+/);
  if (!m) return null;
  const n = parseFloat(m[0]);
  return isNaN(n) ? null : n;
}

export function getStats(trackerId: number): TrackerStats {
  const rows = getDb()
    .prepare('SELECT value, checked_at FROM history WHERE tracker_id = ? AND value IS NOT NULL')
    .all(trackerId) as { value: string; checked_at: string }[];

  const today = new Date().toISOString().slice(0, 10);
  const allNums: number[] = [];
  const todayNums: number[] = [];

  for (const row of rows) {
    const n = parseNum(row.value);
    if (n !== null) {
      allNums.push(n);
      if (row.checked_at.startsWith(today)) todayNums.push(n);
    }
  }

  return {
    globalMin: allNums.length ? Math.min(...allNums) : null,
    globalMax: allNums.length ? Math.max(...allNums) : null,
    globalAvg: allNums.length ? allNums.reduce((a, b) => a + b, 0) / allNums.length : null,
    todayMin: todayNums.length ? Math.min(...todayNums) : null,
    todayMax: todayNums.length ? Math.max(...todayNums) : null,
    count: allNums.length,
  };
}

export function insert(trackerId: number, result: CheckResult): HistoryEntry {
  const res = getDb()
    .prepare('INSERT INTO history (tracker_id, value, status_code, error) VALUES (?, ?, ?, ?)')
    .run(trackerId, result.value, result.statusCode, result.error);
  const row = getDb()
    .prepare('SELECT * FROM history WHERE id = ?')
    .get(res.lastInsertRowid) as HistoryRow;
  return toEntry(row);
}
