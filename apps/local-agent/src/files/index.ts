import type { FileSaveJob } from "@hallederiz/types";
export async function saveFileJob(job: FileSaveJob) { return { ...job, status: "completed" as const, startedAt: job.startedAt ?? new Date().toISOString(), completedAt: new Date().toISOString() }; }
