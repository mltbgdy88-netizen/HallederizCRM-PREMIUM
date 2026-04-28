export * from "./config";
export * from "./files";
export * from "./print";
export * from "./jobs";
export * from "./status";

const agentName = "local-agent";
const port = Number(process.env.PORT_LOCAL_AGENT ?? 4200);

async function bootstrapLocalAgent() {
  console.info(`[${agentName}] foundation ready on port ${port}`);
}

bootstrapLocalAgent().catch((error) => {
  console.error(`[${agentName}] failed`, error);
  process.exit(1);
});
