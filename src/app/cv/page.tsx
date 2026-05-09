import Link from "next/link";
import { CvForm } from "@/components/cv-form";
import { readCv } from "@/lib/store";

export default async function CvPage() {
  const cv = await readCv();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-8">
      <div>
        <Link href="/" className="text-sm font-semibold text-zinc-500 transition hover:text-zinc-900">
          ← Back to dashboard
        </Link>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight">Update your CV</h1>
        <p className="mt-3 max-w-2xl text-zinc-600">
          Add or update the base CV used for job matching and tailored CV generation.
        </p>
      </div>
      <CvForm cv={cv} />
    </main>
  );
}
