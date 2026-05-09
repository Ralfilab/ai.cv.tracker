import Database from "better-sqlite3";
import path from "node:path";

const DB_PATH = path.join(process.cwd(), "data", "cv-checker.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    migrate(_db);
  }

  return _db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS config (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id           TEXT PRIMARY KEY,
      title        TEXT NOT NULL,
      company      TEXT NOT NULL DEFAULT '',
      company_url  TEXT,
      description  TEXT NOT NULL,
      status       TEXT NOT NULL DEFAULT 'pending',
      created_at   TEXT NOT NULL,
      updated_at   TEXT NOT NULL,
      match_report TEXT,
      optimised_cv TEXT,
      cover_letter TEXT
    );

    INSERT OR IGNORE INTO config (key, value) VALUES ('cv', '# Your Base CV
');
  `);

  // Backfill migration: add company_url if missing on existing databases
  const cols = db.prepare("PRAGMA table_info(jobs)").all() as Array<{ name: string }>;
  if (!cols.some((c) => c.name === "company_url")) {
    db.exec("ALTER TABLE jobs ADD COLUMN company_url TEXT");
  }
}
