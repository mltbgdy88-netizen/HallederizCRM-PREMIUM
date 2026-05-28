import type { PrintJob } from "@hallederiz/types";

export async function printJob(job: PrintJob): Promise<PrintJob> {
  const startedAt = job.startedAt ?? new Date().toISOString();
  return {
    ...job,
    status: "not_configured" as const,
    outputMode: "placeholder_disabled" as const,
    startedAt,
    completedAt: new Date().toISOString(),
    errorMessage: "OS printer integration is not configured. Print no-op success is disabled."
  };
}
