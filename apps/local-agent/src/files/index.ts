import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FileSaveJob } from "@hallederiz/types";

export async function saveFileJob(job: FileSaveJob): Promise<FileSaveJob> {
  const startedAt = job.startedAt ?? new Date().toISOString();
  try {
    if (!job.contentBase64) {
      return {
        ...job,
        status: "not_configured" as const,
        outputMode: "placeholder_disabled" as const,
        startedAt,
        completedAt: new Date().toISOString(),
        errorMessage: "File save job does not include a binary payload. Placeholder file generation is disabled."
      };
    }
    await mkdir(job.targetFolder, { recursive: true });
    const targetPath = join(job.targetFolder, job.fileName);
    await writeFile(targetPath, Buffer.from(job.contentBase64, "base64"));
    return {
      ...job,
      status: "completed" as const,
      outputMode: "binary" as const,
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
