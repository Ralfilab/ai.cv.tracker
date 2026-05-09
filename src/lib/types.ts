export type JobStatus = "pending" | "to-apply" | "applied" | "interviewing" | "lack-of-technical-skills" | "rejected";

export const jobStatuses = ["pending", "to-apply", "applied", "interviewing", "lack-of-technical-skills", "rejected"] satisfies JobStatus[];

export type KeywordReport = {
  matched: string[];
  missing: string[];
};

export type MatchReport = {
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  keywords: KeywordReport;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  companyUrl?: string;
  description: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  matchReport?: MatchReport;
  optimisedCv?: string;
  coverLetter?: string;
};

export type CreateJobInput = {
  title: string;
  company: string;
  description: string;
  companyUrl?: string;
};

export type UpdateJobInput = Partial<
  Pick<Job, "status" | "matchReport" | "optimisedCv" | "coverLetter" | "companyUrl">
>;
