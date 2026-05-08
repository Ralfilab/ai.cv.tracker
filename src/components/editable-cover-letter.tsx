"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CopyButton } from "./copy-button";

type EditableCoverLetterProps = {
  jobId: string;
  coverLetter: string | undefined;
  editable: boolean;
};

const maxLength = 200;

export function EditableCoverLetter({ jobId, coverLetter, editable }: EditableCoverLetterProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(coverLetter ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function save() {
    setIsSaving(true);

    await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coverLetter: draft.trim() }),
    });

    setIsSaving(false);
    setIsEditing(false);
    router.refresh();
  }

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">Cover letter</h2>
          <p className="mt-1 text-sm text-zinc-500">Short opener for applications, up to {maxLength} characters.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {coverLetter ? <CopyButton text={isEditing ? draft : coverLetter} /> : null}
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

      {isEditing ? (
        <>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, maxLength))}
            rows={4}
            className="mt-4 w-full rounded-2xl bg-zinc-950 p-5 text-sm leading-6 text-zinc-100 outline-none"
          />
          <p className="mt-2 text-right text-xs text-zinc-500">
            {draft.length}/{maxLength}
          </p>
        </>
      ) : (
        <p className="mt-4 rounded-2xl bg-zinc-50 p-5 text-sm leading-6 text-zinc-700">
          {coverLetter || "Run `/cv-analyze` in Windsurf to generate a 200-character cover letter."}
        </p>
      )}
    </section>
  );
}
