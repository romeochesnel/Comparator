import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let instance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!instance) {
    const dbPath = process.env.DB_PATH ?? path.join(process.cwd(), 'data.db');
    instance = new Database(dbPath);
    instance.pragma('journal_mode = WAL');
    instance.pragma('foreign_keys = ON');
    migrate(instance);
  }
  return instance;
}

export function closeDb(): void {
  if (instance) {
    instance.close();
    instance = null;
  }
}

function migrate(db: Database.Database): void {
  const version = db.pragma('user_version', { simple: true }) as number;

  if (version < 1) {
    db.exec(fs.readFileSync(path.join(__dirname, 'migrations', '001_init.sql'), 'utf-8'));
    db.pragma('user_version = 1');
  }
  if (version < 2) {
    db.exec(fs.readFileSync(path.join(__dirname, 'migrations', '002_js_render.sql'), 'utf-8'));
    db.pragma('user_version = 2');
  }
}
