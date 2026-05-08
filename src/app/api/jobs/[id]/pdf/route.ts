import { NextResponse } from "next/server";
import { renderCvPdf } from "@/lib/cv-pdf";
import { getJob } from "@/lib/store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function filenamePart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const job = await getJob(id);

  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  if (!job.optimisedCv?.trim()) {
    return NextResponse.json({ error: "Optimised CV not available." }, { status: 404 });
  }

  const pdf = await renderCvPdf(job.optimisedCv);
  const filename = [filenamePart(job.company), filenamePart(job.title), "cv.pdf"].filter(Boolean).join("-");

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
