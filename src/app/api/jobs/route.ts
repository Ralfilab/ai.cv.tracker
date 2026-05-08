import { NextResponse } from "next/server";
import { createJob, readJobs } from "@/lib/store";

export async function GET() {
  const jobs = await readJobs();
  return NextResponse.json(jobs);
}

export async function POST(request: Request) {
  const body = await request.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";

  if (!title || !description) {
    return NextResponse.json({ error: "Job title and description are required." }, { status: 400 });
  }

  const job = await createJob({ title, company, description });
  return NextResponse.json(job, { status: 201 });
}
