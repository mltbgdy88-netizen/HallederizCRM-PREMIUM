import { loadSettings } from "./config";
import { saveFileJob } from "./files";
import {
  markFileSaveJobCompleted,
  markFileSaveJobStarted,
  markPrintJobCompleted,
  markPrintJobStarted,
  pollQueue
} from "./jobs";
import { printJob } from "./print";
import { reportLocalStatus } from "./status";

export * from "./config";
export * from "./files";
export * from "./print";
export * from "./jobs";
export * from "./status";

const agentName = "local-agent";

async function processQueueCycle() {
  const snapshot = await pollQueue();

  for (const job of snapshot.fileSaveJobs) {
    await markFileSaveJobStarted(job.id);
    const result = await saveFileJob(job);
    await markFileSaveJobCompleted(job.id, result.status === "failed" ? result.errorMessage : undefined);
  }

  for (const job of snapshot.printJobs) {
    await markPrintJobStarted(job.id);
    const result = await printJob(job);
    await markPrintJobCompleted(job.id, result.status === "failed" ? result.errorMessage : undefined);
  }

  await reportLocalStatus("online", `Queue cycle tamamlandi. print=${snapshot.printJobs.length} save=${snapshot.fileSaveJobs.length}`);
}

async function bootstrapLocalAgent() {
  const settings = loadSettings();
  console.info(`[${agentName}] foundation ready`);
  await reportLocalStatus(settings.safeMode ? "safe_mode" : "online", "Agent bootstrap tamamlandi.");

  setInterval(() => {
    processQueueCycle().catch(async (error) => {
      const message = error instanceof Error ? error.message : "queue cycle failed";
      console.error(`[${agentName}] queue cycle failed`, error);
      await reportLocalStatus("error", message);
    });
  }, settings.pollIntervalMs);
}

bootstrapLocalAgent().catch(async (error) => {
  console.error(`[${agentName}] failed`, error);
  await reportLocalStatus("error", error instanceof Error ? error.message : "bootstrap failed");
  process.exit(1);
});
