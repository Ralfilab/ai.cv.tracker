"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CopyButton } from "./copy-button";

type EditableCvProps = {
  jobId: string;
  optimisedCv: string | undefined;
  editable: boolean;
};

export function EditableCv({ jobId, optimisedCv, editable }: EditableCvProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(optimisedCv ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function save() {
    setIsSaving(true);

    await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optimisedCv: draft }),
    });

    setIsSaving(false);
    setIsEditing(false);
    router.refresh();
  }

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-semibold">Optimised CV</h2>
        <div className="flex flex-wrap gap-2">
          {optimisedCv ? <CopyButton text={isEditing ? draft : optimisedCv} /> : null}
          {optimisedCv ? (
            <a
              href={`/api/jobs/${jobId}/pdf`}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
            >
              Download PDF
            </a>
          ) : null}
          {editable && !isEditing ? (
            <button
              type="button"
              onClick={() => { setDraft(optimisedCv ?? ""); setIsEditing(true); }}
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
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={28}
          className="mt-4 w-full rounded-2xl bg-zinc-950 p-5 text-sm leading-6 text-zinc-100 outline-none"
        />
      ) : (
        <pre className="mt-4 max-h-[760px] overflow-auto whitespace-pre-wrap rounded-2xl bg-zinc-950 p-5 text-sm leading-6 text-zinc-100">
          {optimisedCv || "Run `/cv-analyze` in Windsurf to generate the tailored CV."}
        </pre>
      )}
    </div>
  );
}
