import { NextResponse } from "next/server";
import { readCv, writeCv } from "@/lib/store";

export async function GET() {
  const cv = await readCv();
  return NextResponse.json({ cv });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const cv = typeof body.cv === "string" ? body.cv : "";

  if (!cv.trim()) {
    return NextResponse.json({ error: "CV content is required." }, { status: 400 });
  }

  await writeCv(cv);
  return NextResponse.json({ cv });
}
