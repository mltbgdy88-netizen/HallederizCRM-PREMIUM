const agentName = "local-agent";
const port = Number(process.env.PORT_LOCAL_AGENT ?? 4200);

async function bootstrapLocalAgent() {
  // TODO: Add desktop/local action pipeline with human approval checkpoints.
  console.info(`[${agentName}] ready on port ${port}`);
}

bootstrapLocalAgent().catch((error) => {
  console.error(`[${agentName}] failed`, error);
  process.exit(1);
});
