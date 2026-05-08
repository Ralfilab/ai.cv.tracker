import Link from "next/link";
import { NewJobForm } from "@/components/new-job-form";

export default function NewJobPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-8">
      <div>
        <Link href="/" className="text-sm font-semibold text-zinc-500 transition hover:text-zinc-900">
          ← Back to dashboard
        </Link>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight">Add a job</h1>
        <p className="mt-3 max-w-2xl text-zinc-600">
          Paste a Development Manager or Engineering Manager job description. The job is saved as pending until you run `/cv-analyze` in Windsurf.
        </p>
      </div>
      <NewJobForm />
    </main>
  );
}
