"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { CopyButton } from "./copy-button";

type EditableCoverLetterProps = {
  jobId: string;
  coverLetter: string | undefined;
  editable: boolean;
  companyUrl?: string;
};

export function EditableCoverLetter({ jobId, coverLetter, editable, companyUrl }: EditableCoverLetterProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(coverLetter ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [urlDraft, setUrlDraft] = useState(companyUrl ?? "");

  async function save() {
    setIsSaving(true);

    await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coverLetter: draft }),
    });

    setIsSaving(false);
    setIsEditing(false);
    router.refresh();
  }

  async function saveCompanyUrl(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyUrl: urlDraft.trim() || null }),
    });
    router.refresh();
  }

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">Cover letter</h2>
          <p className="mt-1 text-sm text-zinc-500">Full, tailored cover letter generated from your CV, job description, and the company website.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {coverLetter ? <CopyButton text={isEditing ? draft : coverLetter} /> : null}
          {coverLetter ? (
            <a
              href={`/api/jobs/${jobId}/cover-letter/pdf`}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
            >
              Download PDF
            </a>
          ) : null}
          {/* Cover letter generation moved to /cv-analyze workflow */}
          {editable && !isEditing ? (
            <button
              type="button"
              onClick={() => { setDraft(coverLetter ?? ""); setIsEditing(true); }}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
            >
              Edit
            </button>
          ) : null}
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={isSaving}
                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </>
          ) : null}
        </div>
      </div>

      {companyUrl ? null : (
        <form onSubmit={saveCompanyUrl} className="mt-4 rounded-2xl bg-zinc-50 p-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Company website
            <input
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              placeholder="https://company.com"
              className="rounded-xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none transition focus:border-zinc-400"
            />
          </label>
          <div className="mt-3 flex justify-end">
            <button type="submit" className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700">Save website</button>
          </div>
        </form>
      )}

      {isEditing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={24}
          className="mt-4 w-full rounded-2xl bg-zinc-950 p-5 text-sm leading-6 text-zinc-100 outline-none"
        />
      ) : (
        <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-zinc-50 p-5 text-sm leading-6 text-zinc-700">
          {coverLetter || "Run `/cv-analyze` in Windsurf to generate a full cover letter, then edit and download the PDF here."}
        </pre>
      )}
    </section>
  );
}
