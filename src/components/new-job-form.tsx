"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function NewJobForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        company: formData.get("company"),
        description: formData.get("description"),
        companyUrl: formData.get("companyUrl"),
      }),
    });

    if (!response.ok) {
      const body = await response.json();
      setError(body.error ?? "Could not save the job.");
      setIsSubmitting(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
          Job title
          <input
            name="title"
            required
            placeholder="Engineering Manager"
            className="rounded-xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none transition focus:border-zinc-400"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
          Company
          <input
            name="company"
            placeholder="Company name"
            className="rounded-xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none transition focus:border-zinc-400"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
          Company website (optional)
          <input
            name="companyUrl"
            placeholder="https://company.com"
            className="rounded-xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none transition focus:border-zinc-400"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
        Job description
        <textarea
          name="description"
          required
          rows={16}
          placeholder="Paste the full job description here..."
          className="rounded-xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none transition focus:border-zinc-400"
        />
      </label>

      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-500">After saving, run `/cv-analyze` in Windsurf to generate the score and optimised CV.</p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save job"}
        </button>
      </div>
    </form>
  );
}
