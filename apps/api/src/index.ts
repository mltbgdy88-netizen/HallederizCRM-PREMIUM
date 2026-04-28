import Fastify from "fastify";
import { registerCommercialOperationsRoutes } from "./commercial-operations/routes";
import { registerIntegrationRoutes } from "./integrations/routes";
import { registerOperationsEngineRoutes } from "./operations-engine/routes";
import { registerPlatformCoreRoutes } from "./platform-core/routes";
import { registerProductStockPricingRoutes } from "./product-stock-pricing/routes";
import { registerSalesCrmRoutes } from "./sales-crm/routes";

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
  await registerPlatformCoreRoutes(server);
  await registerProductStockPricingRoutes(server);
  await registerSalesCrmRoutes(server);
  await registerCommercialOperationsRoutes(server);
  await registerOperationsEngineRoutes(server);
  await registerIntegrationRoutes(server);
  await server.listen({ port, host });
}

bootstrap().catch((error) => {
  server.log.error(error);
  process.exit(1);
});
