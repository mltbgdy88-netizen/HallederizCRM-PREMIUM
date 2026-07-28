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
import { startLocalWhatsAppWebControlPlane } from "./whatsapp-web-local-control-plane";

export * from "./config";
export * from "./files";
export * from "./print";
export * from "./jobs";
export * from "./status";
export * from "./whatsapp-web-local";
export * from "./whatsapp-web-local-control-plane";

const agentName = "local-agent";

async function processQueueCycle() {
  const snapshot = await pollQueue();

  for (const job of snapshot.fileSaveJobs) {
    await markFileSaveJobStarted(job.id);
    const result = await saveFileJob(job);
    await markFileSaveJobCompleted(job.id, result.status === "completed" ? undefined : result.errorMessage ?? result.status);
  }

  for (const job of snapshot.printJobs) {
    await markPrintJobStarted(job.id);
    const result = await printJob(job);
    await markPrintJobCompleted(job.id, result.status === "completed" ? undefined : result.errorMessage ?? result.status);
  }

  await reportLocalStatus("online", `Queue cycle tamamlandi. print=${snapshot.printJobs.length} save=${snapshot.fileSaveJobs.length}`);
}

async function bootstrapLocalAgent() {
  const settings = loadSettings();
  console.info(`[${agentName}] foundation ready`);
  if (settings.whatsappWebLocalControlToken) {
    await startLocalWhatsAppWebControlPlane({
      controlToken: settings.whatsappWebLocalControlToken,
      port: settings.whatsappWebLocalControlPort,
      runtimeEnvironment: process.env
    });
    console.info(`[${agentName}] local control plane ready on loopback`);
  }
  if (settings.mode === "disabled") {
    await reportLocalStatus("disabled", "Agent disabled modunda.");
    return;
  }
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
