import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FileSaveJob } from "@hallederiz/types";

export async function saveFileJob(job: FileSaveJob) {
  const startedAt = job.startedAt ?? new Date().toISOString();
  try {
    await mkdir(job.targetFolder, { recursive: true });
    const targetPath = join(job.targetFolder, job.fileName);
    const content = `HallederizCRM placeholder document\nDocumentId: ${job.documentId}\nGeneratedAt: ${new Date().toISOString()}\n`;
    await writeFile(targetPath, content, "utf8");
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
      errorMessage: error instanceof Error ? error.message : "File save failed"
    };
  }
}
