import type { PrintJob } from "@hallederiz/types";

export async function printJob(job: PrintJob) {
  const startedAt = job.startedAt ?? new Date().toISOString();
  try {
    // OS-level print entegrasyonu bir sonraki batchte driver bazli tamamlanacak.
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      ...job,
      status: "completed" as const,
      startedAt,
      completedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      ...job,
      status: "failed" as const,
      startedAt,
      completedAt: new Date().toISOString(),
      errorMessage: error instanceof Error ? error.message : "Print execution failed"
    };
  }
}
