import Fastify from "fastify";

const server = Fastify({
  logger: true
});

const port = Number(process.env.PORT_API ?? 4000);
const host = process.env.HOST_API ?? "0.0.0.0";

server.get("/health", async () => {
  return {
    status: "ok",
    service: "api"
  };
});

server.get("/", async () => {
  return {
    name: "HallederizCRM-PREMIUM API",
    message: "Bootstrap is ready"
  };
});

async function bootstrap() {
  // TODO: Register plugins, auth, and tenant-aware routes here.
  await server.listen({ port, host });
}

bootstrap().catch((error) => {
  server.log.error(error);
  process.exit(1);
});
