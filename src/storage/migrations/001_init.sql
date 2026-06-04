CREATE TABLE IF NOT EXISTS trackers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  url        TEXT    NOT NULL,
  selector   TEXT    NOT NULL,
  interval   INTEGER NOT NULL DEFAULT 60,
  active     INTEGER NOT NULL DEFAULT 1,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS history (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  tracker_id  INTEGER NOT NULL REFERENCES trackers(id) ON DELETE CASCADE,
  value       TEXT,
  status_code INTEGER,
  error       TEXT,
  checked_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_history_tracker   ON history(tracker_id);
CREATE INDEX IF NOT EXISTS idx_history_timestamp ON history(checked_at);
