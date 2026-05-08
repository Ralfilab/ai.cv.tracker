import { randomUUID } from "node:crypto";
import { getDb } from "./db";
import type { CreateJobInput, Job, UpdateJobInput } from "./types";

// ---------------------------------------------------------------------------
// Row ↔ Job mapping
// ---------------------------------------------------------------------------

interface JobRow {
  id: string;
  title: string;
  company: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  match_report: string | null;
  optimised_cv: string | null;
  cover_letter: string | null;
}

function rowToJob(row: JobRow): Job {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    description: row.description,
    status: row.status as Job["status"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...(row.match_report ? { matchReport: JSON.parse(row.match_report) } : {}),
    ...(row.optimised_cv ? { optimisedCv: row.optimised_cv } : {}),
    ...(row.cover_letter ? { coverLetter: row.cover_letter } : {}),
  };
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export async function readJobs(): Promise<Job[]> {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM jobs ORDER BY created_at DESC").all() as JobRow[];
  return rows.map(rowToJob);
}

export async function createJob(input: CreateJobInput): Promise<Job> {
  const db = getDb();
  const now = new Date().toISOString();
  const id = randomUUID();

  db.prepare(
    `INSERT INTO jobs (id, title, company, description, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
  ).run(id, input.title.trim(), input.company.trim(), input.description.trim(), now, now);

  return (await getJob(id))!;
}

export async function getJob(id: string): Promise<Job | undefined> {
  const db = getDb();
  const row = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id) as JobRow | undefined;
  return row ? rowToJob(row) : undefined;
}

export async function updateJob(id: string, input: UpdateJobInput): Promise<Job | undefined> {
  const db = getDb();
  const existing = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id) as JobRow | undefined;

  if (!existing) {
    return undefined;
  }

  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (input.status !== undefined) {
    sets.push("status = ?");
    values.push(input.status);
  }

  if (input.matchReport !== undefined) {
    sets.push("match_report = ?");
    values.push(JSON.stringify(input.matchReport));
  }

  if (input.optimisedCv !== undefined) {
    sets.push("optimised_cv = ?");
    values.push(input.optimisedCv);
  }

  if (input.coverLetter !== undefined) {
    sets.push("cover_letter = ?");
    values.push(input.coverLetter);
  }

  values.push(id);
  db.prepare(`UPDATE jobs SET ${sets.join(", ")} WHERE id = ?`).run(...values);

  return getJob(id);
}

// ---------------------------------------------------------------------------
// CV
// ---------------------------------------------------------------------------

export async function readCv(): Promise<string> {
  const db = getDb();
  const row = db.prepare("SELECT value FROM config WHERE key = 'cv'").get() as { value: string } | undefined;
  return row?.value ?? "# Your Base CV\n";
}

export async function writeCv(content: string): Promise<void> {
  const db = getDb();
  db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES ('cv', ?)").run(content);
}
