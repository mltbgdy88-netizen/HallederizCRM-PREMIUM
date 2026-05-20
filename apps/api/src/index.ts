import cors from "@fastify/cors";
import Fastify from "fastify";
import { registerAiLocalOutputRoutes } from "./ai-local-output-routes";
import { registerCommercialOperationsRoutes } from "./commercial-operations/routes";
import { registerImportRoutes } from "./imports/routes";
import { registerIntegrationRoutes } from "./integrations/routes";
import { registerAiAssistantPlanRoutes } from "./modules/ai-assistant/plan-routes";
import { registerArchiveRoutes } from "./modules/archive/routes";
import { registerOperationsEngineRoutes } from "./operations-engine/routes";
import { registerPlatformCoreRoutes } from "./platform-core/routes";
import { registerProductStockPricingRoutes } from "./product-stock-pricing/routes";
import { registerQuickOperationsRoutes } from "./quick-operations/routes";
import { registerSalesCrmRoutes } from "./sales-crm/routes";
import { buildApiCorsOptions } from "./shared/cors-config";
import { bootstrapRuntimeEnvValidation } from "./shared/runtime-env-bootstrap";

bootstrapRuntimeEnvValidation();

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
  await server.register(cors, buildApiCorsOptions());
  await registerPlatformCoreRoutes(server);
  await registerProductStockPricingRoutes(server);
  await registerSalesCrmRoutes(server);
  await registerCommercialOperationsRoutes(server);
  await registerArchiveRoutes(server);
  await registerOperationsEngineRoutes(server);
  await registerIntegrationRoutes(server);
  await registerImportRoutes(server);
  await registerQuickOperationsRoutes(server);
  await registerAiAssistantPlanRoutes(server);
  await registerAiLocalOutputRoutes(server);
  await server.listen({ port, host });
}

bootstrap().catch((error) => {
  server.log.error(error);
  process.exit(1);
});
