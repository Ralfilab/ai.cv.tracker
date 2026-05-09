"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type CvFormProps = {
  cv: string;
};

export function CvForm({ cv }: CvFormProps) {
  const router = useRouter();
  const [draft, setDraft] = useState(cv);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const response = await fetch("/api/cv", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cv: draft }),
    });

    if (!response.ok) {
      const body = await response.json();
      setError(body.error ?? "Could not save the CV.");
      setIsSubmitting(false);
      return;
    }

    setSuccess("CV saved.");
    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
        Base CV
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          required
          rows={30}
          placeholder="Paste your full base CV here..."
          className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-sm leading-6 text-zinc-900 outline-none transition focus:border-zinc-400"
        />
      </label>

      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {success ? <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-500">This CV is used as the source for `/cv-analyze` and appears as the base CV on job pages.</p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save CV"}
        </button>
      </div>
    </form>
  );
}
