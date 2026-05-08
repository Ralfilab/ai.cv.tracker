---
description: Analyse pending jobs against cv.md and write match reports plus optimised CVs
---

# CV Analyse Workflow

Use this workflow when the user runs `/cv-analyze` from Windsurf.

## Goal

Analyse every pending job in `data/jobs.json` against the base CV in `data/cv.md`, then write the AI output back into the same job records.

## Prerequisites

The dev server must be running at `http://localhost:3000` before starting.

## Steps

1. Fetch the base CV via the API:
   ```
   curl http://localhost:3000/api/cv
   ```
   The response JSON has shape `{ "cv": "..." }`.

2. Fetch all jobs via the API:
   ```
   curl http://localhost:3000/api/jobs
   ```

3. Find jobs where `status` is exactly `"pending"`.

4. For each pending job, produce:
   - `matchReport.score`: integer from 0 to 100
   - `matchReport.summary`: concise explanation of fit
   - `matchReport.strengths`: 3-6 bullets
   - `matchReport.gaps`: 3-6 bullets
   - `matchReport.keywords.matched`: ATS/recruiter keywords already supported by the CV
   - `matchReport.keywords.missing`: important ATS/recruiter keywords that are weak or absent
   - `optimisedCv`: a Markdown CV tailored to the job description
   - `coverLetter`: a concise application opener, maximum 200 characters, based on the job description and truthful CV fit

5. Update each processed job via the API:
   ```
   curl -X PATCH http://localhost:3000/api/jobs/<id> \
     -H "Content-Type: application/json" \
     -d '{ "status": "to-apply", "matchReport": {...}, "optimisedCv": "...", "coverLetter": "..." }'
   ```

## Scoring lens

Target roles: Development Manager and Engineering Manager.

Prioritise evidence around:

- People leadership and line management
- Hiring, onboarding, mentoring, performance management
- Delivery ownership, roadmap execution, project/program management
- Agile/Scrum/Kanban, ceremonies, planning, forecasting
- Stakeholder management and cross-functional collaboration
- Architecture and technical breadth without over-indexing on hands-on coding
- Incident ownership, reliability, operational excellence
- Team scaling, process improvement, engineering culture
- Metrics, OKRs, business outcomes, productivity, quality
- Communication with senior leadership and product/business partners

## CV optimisation rules

- Do not fabricate experience, employers, degrees, metrics, technologies, or certifications.
- Rephrase existing experience to better match the job description and ATS keywords.
- Keep the candidate credible for Development Manager / Engineering Manager roles.
- Prefer quantified impact only when the base CV already contains numbers or clear measurable context.
- Use Markdown headings and concise bullets.
- Do not add horizontal rules or standalone `---` separator lines between sections.
- Preserve truthful technical scope while emphasizing leadership and delivery.
- Keep the cover letter natural, specific to the role, and no longer than 200 characters including spaces.

## PATCH payload shape

Each PATCH request body should look like:

```json
{
  "status": "to-apply",
  "matchReport": {
    "score": 78,
    "summary": "Short explanation.",
    "strengths": ["..."],
    "gaps": ["..."],
    "keywords": {
      "matched": ["Engineering leadership", "Agile delivery"],
      "missing": ["Budget ownership"]
    }
  },
  "optimisedCv": "# Tailored CV...",
  "coverLetter": "I'm excited to bring engineering leadership, delivery ownership, and team-building experience to this role while helping your teams ship reliable products."
}
```
