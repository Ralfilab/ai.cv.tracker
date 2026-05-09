---
description: Analyse to-apply jobs against the base CV from the database and write match reports plus optimised CVs
---

# CV Analyse Workflow

Use this workflow when the user runs `/cv-analyze` from Windsurf.

## Goal

Analyse every job in the `to-apply` state against the base CV stored in the database (fetched via `/api/cv`), then write the AI output back into the same job records via the API.

## Prerequisites

The dev server must be running at `http://localhost:3000` before starting.

## Steps

1. Fetch the base CV from the database via the API:
   ```
   curl http://localhost:3000/api/cv
   ```
   The response JSON has shape `{ "cv": "..." }`.

2. Fetch only jobs in the `to-apply` state via the API:
   ```
   curl "http://localhost:3000/api/jobs?status=to-apply"
   ```

3. Process the returned jobs (already filtered to `"to-apply"`).

3.5 For each `to-apply` job, if `companyUrl` is present, crawl a small set of same‑origin pages from the company website (no external search): `/`, `/about`, `/about-us`, `/company`, `/careers`, `/jobs`, `/news`, `/press`, `/blog`. Extract readable on‑page text and summarise salient themes (mission, products, customers, culture, recent updates). If `companyUrl` is missing, skip research and rely on the CV and job description only.

4. For each `to-apply` job, produce:
   - `matchReport.score`: integer from 0 to 100
   - `matchReport.summary`: concise explanation of fit
   - `matchReport.strengths`: 3-6 bullets
   - `matchReport.gaps`: 3-6 bullets
   - `matchReport.keywords.matched`: ATS/recruiter keywords already supported by the CV
   - `matchReport.keywords.missing`: important ATS/recruiter keywords that are weak or absent
   - `optimisedCv`: a Markdown CV tailored to the job description
   - `coverLetter`: a full, structured cover letter grounded in the company website when available (see step 3.5) and personalised to the role and CV. No hard length limit. The letter must include:
     - a professional salutation
     - an introductory paragraph aligned to the company’s mission/products/customers
     - 2–3 body paragraphs linking the candidate’s relevant experience and keywords to the role
     - a closing paragraph with a clear call to action
     - a professional sign‑off with the candidate’s name

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
- Cover letter: write a full, well‑structured letter (no hard length limit; aim ~400–700 words) with salutation, intro, 2–3 body paragraphs, closing, and sign‑off. Ground all claims in the provided CV and, when available, facts from the company website (no external sources). Do not fabricate employers, projects, metrics, or achievements.

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
  "coverLetter": "Dear Hiring Manager,\n\nI’m excited to apply for the Engineering Manager role at <Company>. Your focus on <mission/products/customers> resonates with my experience leading teams that delivered <relevant outcomes>.\n\nIn my previous role at <Org>, I led <team/size> to ship <projects> that improved <metrics/outcomes>. I partnered with product and cross‑functional leaders, introduced <process/ceremonies>, and coached engineers to grow in impact and autonomy.\n\nThis role’s emphasis on <keywords> aligns with my background in <evidence from CV>. I’ve scaled teams, improved delivery predictability, and raised quality with data‑informed practices.\n\nI’d welcome the chance to discuss how I can help <Company> achieve <goals>.\n\nSincerely,\nYour Name"
}
```
