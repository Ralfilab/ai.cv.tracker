import type { JobStatus } from "./types";

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function statusLabel(status: JobStatus) {
  return status
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function statusClassName(status: JobStatus) {
  switch (status) {
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "to-apply":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "applied":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "interviewing":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "rejected":
      return "border-zinc-200 bg-zinc-100 text-zinc-600";
  }
}
