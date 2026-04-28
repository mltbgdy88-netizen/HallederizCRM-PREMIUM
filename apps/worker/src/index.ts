const workerName = "operations-worker";

async function bootstrapWorker() {
  // TODO: Connect queue provider and register job processors.
  console.info(`[${workerName}] started`);
}

bootstrapWorker().catch((error) => {
  console.error(`[${workerName}] failed`, error);
  process.exit(1);
});
