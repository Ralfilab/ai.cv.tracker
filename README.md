# AI CV Tracker (Windsurf)

A local Next.js app for tracking Development Manager / Engineering Manager applications and optimising your CV with Cascade inside Windsurf.

## How it works

1. Run the web app and add your base CV via the UI or API.
2. Add one or more job descriptions.
3. Run `/cv-analyze` in Windsurf (dev server must be running).
4. Cascade fetches the CV and pending jobs via the API.
5. Cascade writes match scores, keyword gaps, and a tailored CV back via `PATCH /api/jobs/:id`.
6. Refresh the web app to review results and update application status.

No external API key is required.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

On first run the SQLite database is created automatically at `data/cv-checker.db`.

## Data storage

All data lives in a local SQLite database at `data/cv-checker.db` (gitignored — never committed).

| Table    | Purpose                                        |
| -------- | ---------------------------------------------- |
| `jobs`   | Job descriptions, match reports, optimised CVs |
| `config` | Key-value store (CV content under key `cv`)    |

### Migrating from flat files

If you previously used `data/cv.md` and `data/jobs.json`, import them once:

```bash
node scripts/migrate-to-sqlite.mjs
```

### API endpoints

| Method  | Endpoint              | Description              |
| ------- | --------------------- | ------------------------ |
| `GET`   | `/api/cv`             | Fetch the base CV        |
| `PUT`   | `/api/cv`             | Update the base CV       |
| `GET`   | `/api/jobs`           | List all jobs            |
| `POST`  | `/api/jobs`           | Create a new job         |
| `GET`   | `/api/jobs/:id`       | Get a single job         |
| `PATCH` | `/api/jobs/:id`       | Update a job             |
| `GET`   | `/api/jobs/:id/pdf`   | Download optimised CV PDF |

## Windsurf workflow

The workflow lives at:

```text
.windsurf/workflows/cv-analyze.md
```

Run `/cv-analyze` from Windsurf after adding one or more jobs. The dev server must be running — the workflow fetches data via the API. It processes all jobs with `status: "pending"` and changes them to `status: "to-apply"` after analysis.

## Job statuses

- `pending` — saved, awaiting Cascade analysis
- `to-apply` — analysed and ready to apply
- `applied` — application submitted
- `interviewing` — active interview process
- `rejected` — closed/rejected
