import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Cover letter generation has moved to the /cv-analyze workflow. Please run /cv-analyze to (re)generate." },
    { status: 410 },
  );
}
