import Link from "next/link";
import { notFound } from "next/navigation";
import { EditableCoverLetter } from "@/components/editable-cover-letter";
import { EditableCv } from "@/components/editable-cv";
import { StatusSelect } from "@/components/status-select";
import { formatDate, statusClassName, statusLabel } from "@/lib/format";
import { getJob, readCv } from "@/lib/store";

type JobPageProps = {
  params: Promise<{ id: string }>;
};

export default async function JobPage({ params }: JobPageProps) {
  const { id } = await params;
  const job = await getJob(id);

  if (!job) {
    notFound();
  }

  const baseCv = await readCv();
  const report = job.matchReport;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link href="/" className="text-sm font-semibold text-zinc-500 transition hover:text-zinc-900">
            ← Back to dashboard
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClassName(job.status)}`}>
              {statusLabel(job.status)}
            </span>
            <span className="text-sm text-zinc-500">Added {formatDate(job.createdAt)}</span>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">{job.title}</h1>
          <p className="mt-2 text-lg text-zinc-500">{job.company || "Company not set"}</p>
        </div>
        <div className="w-full max-w-xs rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <StatusSelect jobId={job.id} currentStatus={job.status} />
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">Match score</p>
            {report ? (
              <>
                <p className="mt-3 text-6xl font-semibold tracking-tight">{report.score}%</p>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-100">
                  <div className="h-full rounded-full bg-zinc-900" style={{ width: `${report.score}%` }} />
                </div>
                <p className="mt-5 text-sm leading-6 text-zinc-600">{report.summary}</p>
              </>
            ) : (
              <p className="mt-4 text-sm leading-6 text-zinc-600">Run `/cv-analyze` in Windsurf to generate match scoring and an optimised CV.</p>
            )}
          </div>

          {report ? (
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="font-semibold">Keyword report</h2>
              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-sm font-medium text-emerald-700">Matched</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {report.keywords.matched.map((keyword) => (
                      <span key={keyword} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-700">Missing</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {report.keywords.missing.map((keyword) => (
                      <span key={keyword} className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </aside>

        <div className="space-y-6">
          <EditableCoverLetter
            jobId={job.id}
            coverLetter={job.coverLetter}
            editable={job.status === "to-apply" || job.status === "pending"}
            companyUrl={job.companyUrl}
          />

          {report ? (
            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="font-semibold">Strengths</h2>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-600">
                  {report.strengths.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="font-semibold">Gaps</h2>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-600">
                  {report.gaps.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="font-semibold">Base CV</h2>
              <pre className="mt-4 max-h-[760px] overflow-auto whitespace-pre-wrap rounded-2xl bg-zinc-50 p-5 text-sm leading-6 text-zinc-700">{baseCv}</pre>
            </div>
            <EditableCv jobId={job.id} optimisedCv={job.optimisedCv} editable={job.status === "to-apply" || job.status === "pending"} />
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold">Job description</h2>
            <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-2xl bg-zinc-50 p-5 text-sm leading-6 text-zinc-700">{job.description}</pre>
          </section>
        </div>
      </section>
    </main>
  );
}
