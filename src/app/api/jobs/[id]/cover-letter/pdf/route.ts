import { NextResponse } from "next/server";
import { getJob, readCv } from "@/lib/store";
import { renderCoverLetterPdf } from "@/lib/cover-letter-pdf";

function filenamePart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const job = await getJob(id);

  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  if (!job.coverLetter?.trim()) {
    return NextResponse.json({ error: "Cover letter not available." }, { status: 404 });
  }

  const cv = await readCv();
  const pdf = await renderCoverLetterPdf(job.coverLetter, { company: job.company, companyUrl: job.companyUrl, cvMarkdown: cv });
  const filename = [filenamePart(job.company), filenamePart(job.title), "cover-letter.pdf"].filter(Boolean).join("-");

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
