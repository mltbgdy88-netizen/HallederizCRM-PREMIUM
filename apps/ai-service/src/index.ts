export * from "./modules/contracts";
export * from "./modules/llm";
export * from "./modules/stt";
export * from "./modules/tts";
export * from "./modules/proposals";
export * from "./modules/insights";
export * from "./modules/execution";

const serviceName = "ai-service";
const port = Number(process.env.PORT_AI_SERVICE ?? 4100);

async function bootstrapAiService() {
  console.info(`[${serviceName}] foundation ready on port ${port}`);
}

bootstrapAiService().catch((error) => {
  console.error(`[${serviceName}] failed`, error);
  process.exit(1);
});
