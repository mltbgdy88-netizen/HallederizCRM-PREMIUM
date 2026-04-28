import type { PrintJob } from "@hallederiz/types";
export async function printJob(job: PrintJob) { return { ...job, status: "completed" as const, startedAt: job.startedAt ?? new Date().toISOString(), completedAt: new Date().toISOString() }; }
