import { getDb } from './db';
import { HistoryEntry, CheckResult } from '../types';

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

export function insert(trackerId: number, result: CheckResult): HistoryEntry {
  const res = getDb()
    .prepare('INSERT INTO history (tracker_id, value, status_code, error) VALUES (?, ?, ?, ?)')
    .run(trackerId, result.value, result.statusCode, result.error);
  const row = getDb()
    .prepare('SELECT * FROM history WHERE id = ?')
    .get(res.lastInsertRowid) as HistoryRow;
  return toEntry(row);
}
