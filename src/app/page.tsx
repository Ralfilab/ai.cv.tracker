import Link from "next/link";
import { formatDate, statusClassName, statusLabel } from "@/lib/format";
import { readJobs } from "@/lib/store";

export default async function Home() {
  const jobs = await readJobs();
  const appliedCount = jobs.filter((job) => job.status === "applied").length;
  const interviewingCount = jobs.filter((job) => job.status === "interviewing").length;
  const pendingCount = jobs.filter((job) => job.status === "pending").length;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-8">
      <section className="rounded-[2rem] bg-zinc-950 p-8 text-white shadow-xl shadow-zinc-200">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-zinc-400">CV Checker</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
              Track and optimise Engineering Manager applications.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300">
              Save jobs here, run `/cv-analyze` in Windsurf, then review match scores, keyword gaps, and tailored CV versions.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/cv"
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Update CV
            </Link>
            <Link
              href="/jobs/new"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              Add job
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Total jobs", jobs.length],
          ["Pending analysis", pendingCount],
          ["Applied", appliedCount],
          ["Interviewing", interviewingCount],
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 px-6 py-5">
          <h2 className="text-lg font-semibold">Applications</h2>
        </div>
        {jobs.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-lg font-semibold text-zinc-900">No jobs yet</p>
            <p className="mt-2 text-zinc-500">Add your first Development Manager or Engineering Manager role.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Match</th>
                  <th className="px-6 py-4">Added</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {jobs.map((job) => (
                  <tr key={job.id} className="transition hover:bg-zinc-50">
                    <td className="px-6 py-5">
                      <p className="font-semibold text-zinc-950">{job.title}</p>
                      <p className="mt-1 text-zinc-500">{job.company || "Company not set"}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClassName(job.status)}`}>
                        {statusLabel(job.status)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {job.matchReport ? (
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-28 overflow-hidden rounded-full bg-zinc-100">
                            <div className="h-full rounded-full bg-zinc-900" style={{ width: `${job.matchReport.score}%` }} />
                          </div>
                          <span className="font-semibold">{job.matchReport.score}%</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400">Run /cv-analyze</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-zinc-500">{formatDate(job.createdAt)}</td>
                    <td className="px-6 py-5 text-right">
                      <Link href={`/jobs/${job.id}`} className="font-semibold text-zinc-900 hover:text-zinc-600">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
