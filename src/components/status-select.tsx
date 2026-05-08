"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { JobStatus } from "@/lib/types";

const statuses: JobStatus[] = ["pending", "to-apply", "applied", "interviewing", "rejected"];

export function StatusSelect({ jobId, currentStatus }: { jobId: string; currentStatus: JobStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isSaving, setIsSaving] = useState(false);

  async function updateStatus(nextStatus: JobStatus) {
    setStatus(nextStatus);
    setIsSaving(true);

    await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    setIsSaving(false);
    router.refresh();
  }

  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
      Application status
      <select
        value={status}
        onChange={(event) => updateStatus(event.target.value as JobStatus)}
        className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400"
      >
        {statuses.map((item) => (
          <option key={item} value={item}>
            {item.replace("-", " ")}
          </option>
        ))}
      </select>
      {isSaving ? <span className="text-xs text-zinc-500">Saving...</span> : null}
    </label>
  );
}
