#!/usr/bin/env node
/**
 * One-time migration: imports data/cv.md and data/jobs.json into the SQLite DB.
 *
 * Usage:  node scripts/migrate-to-sqlite.mjs
 *
 * Safe to run multiple times — uses INSERT OR REPLACE for the CV and
 * INSERT OR IGNORE for jobs (won't overwrite existing rows).
 */

import Database from "better-sqlite3";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dataDir = join(root, "data");
const dbPath = join(dataDir, "cv-checker.db");
const cvPath = join(dataDir, "cv.md");
const jobsPath = join(dataDir, "jobs.json");

mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

// Ensure tables exist
db.exec(`
  CREATE TABLE IF NOT EXISTS config (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id           TEXT PRIMARY KEY,
    title        TEXT NOT NULL,
    company      TEXT NOT NULL DEFAULT '',
    description  TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'pending',
    created_at   TEXT NOT NULL,
    updated_at   TEXT NOT NULL,
    match_report TEXT,
    optimised_cv TEXT,
    cover_letter TEXT
  );
`);

// ── Migrate CV ──────────────────────────────────────────────────────────────
if (existsSync(cvPath)) {
  const cv = readFileSync(cvPath, "utf8");
  db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES ('cv', ?)").run(cv);
  console.log(`✔ Imported CV from ${cvPath} (${cv.length} chars)`);
} else {
  console.log(`⏭ No cv.md found at ${cvPath} — skipping`);
}

// ── Migrate Jobs ────────────────────────────────────────────────────────────
if (existsSync(jobsPath)) {
  const raw = readFileSync(jobsPath, "utf8");
  const jobs = JSON.parse(raw || "[]");

  const insert = db.prepare(`
    INSERT OR IGNORE INTO jobs
      (id, title, company, description, status, created_at, updated_at, match_report, optimised_cv, cover_letter)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction((items) => {
    for (const j of items) {
      insert.run(
        j.id,
        j.title ?? "",
        j.company ?? "",
        j.description ?? "",
        j.status ?? "pending",
        j.createdAt ?? new Date().toISOString(),
        j.updatedAt ?? new Date().toISOString(),
        j.matchReport ? JSON.stringify(j.matchReport) : null,
        j.optimisedCv ?? null,
        j.coverLetter ?? null,
      );
    }
  });

  tx(jobs);
  console.log(`✔ Imported ${jobs.length} job(s) from ${jobsPath}`);
} else {
  console.log(`⏭ No jobs.json found at ${jobsPath} — skipping`);
}

db.close();
console.log(`\n✅ Database ready at ${dbPath}`);
