import { NextResponse } from "next/server";
import { createJob, readJobs } from "@/lib/store";
import { jobStatuses } from "@/lib/types";
import type { JobStatus } from "@/lib/types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status");
  const status = jobStatuses.includes(statusParam as JobStatus) ? (statusParam as JobStatus) : undefined;
  const jobs = await readJobs(status);
  return NextResponse.json(jobs);
}

export async function POST(request: Request) {
  const body = await request.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const companyUrl = typeof body.companyUrl === "string" ? body.companyUrl.trim() : undefined;

  if (!title || !description) {
    return NextResponse.json({ error: "Job title and description are required." }, { status: 400 });
  }

  const job = await createJob({ title, company, description, companyUrl });
  return NextResponse.json(job, { status: 201 });
}
