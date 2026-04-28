const serviceName = "ai-service";
const port = Number(process.env.PORT_AI_SERVICE ?? 4100);

async function bootstrapAiService() {
  // TODO: Add local model orchestration and human-approval flows.
  console.info(`[${serviceName}] ready on port ${port}`);
}

bootstrapAiService().catch((error) => {
  console.error(`[${serviceName}] failed`, error);
  process.exit(1);
});
