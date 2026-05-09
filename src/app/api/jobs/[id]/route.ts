import { NextResponse } from "next/server";
import { getJob, updateJob } from "@/lib/store";
import type { JobStatus, UpdateJobInput } from "@/lib/types";

const statuses: JobStatus[] = ["pending", "to-apply", "applied", "interviewing", "rejected"];

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const job = await getJob(id);

  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  return NextResponse.json(job);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json();

  if (body.status && !statuses.includes(body.status)) {
    return NextResponse.json({ error: "Invalid job status." }, { status: 400 });
  }

  const input: UpdateJobInput = {};

  if ("status" in body) {
    input.status = body.status;
  }

  if ("matchReport" in body) {
    input.matchReport = body.matchReport;
  }

  if ("optimisedCv" in body) {
    input.optimisedCv = body.optimisedCv;
  }

  if ("coverLetter" in body) {
    input.coverLetter = body.coverLetter;
  }

  if ("companyUrl" in body) {
    input.companyUrl = body.companyUrl;
  }

  const job = await updateJob(id, input);

  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  return NextResponse.json(job);
}
