import cors from "@fastify/cors";
import Fastify from "fastify";
import { registerAiLocalOutputRoutes } from "./ai-local-output-routes";
import { registerCommercialOperationsRoutes } from "./commercial-operations/routes";
import { registerImportRoutes } from "./imports/routes";
import { registerIntegrationRoutes } from "./integrations/routes";
import { registerAiAssistantPlanRoutes } from "./modules/ai-assistant/plan-routes";
import { registerArchiveRoutes } from "./modules/archive/routes";
import { registerDashboardAnnouncementRoutes } from "./dashboard/routes";
import { registerOperatorConsoleRoutes } from "./operator/routes";
import { registerOperationsEngineRoutes } from "./operations-engine/routes";
import { registerPlatformCoreRoutes } from "./platform-core/routes";
import { registerProductStockPricingRoutes } from "./product-stock-pricing/routes";
import { registerQuickOperationsRoutes } from "./quick-operations/routes";
import { registerSalesCrmRoutes } from "./sales-crm/routes";
import { buildApiCorsOptions } from "./shared/cors-config";
import { registerApiRateLimits } from "./shared/rate-limit";
import { registerOriginGuard } from "./shared/origin-guard";
import { bootstrapRuntimeEnvValidation } from "./shared/runtime-env-bootstrap";
import { bootstrapApprovalCommercialActionHandlers } from "./shared/approval-commercial-action-handlers";
import { bootstrapWorkerDomainExecutionPort } from "./shared/worker-domain-execution-port";
import { createPostgresMigrationExecutor, databaseMigrations, listAppliedMigrations } from "@hallederiz/database";

bootstrapRuntimeEnvValidation();
bootstrapApprovalCommercialActionHandlers();
bootstrapWorkerDomainExecutionPort();

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

server.get("/ready", async (_request, reply) => {
  const databaseConfigured = Boolean((process.env.POSTGRES_URL ?? process.env.DATABASE_URL)?.trim());
  if (!databaseConfigured) {
    if (process.env.NODE_ENV === "production") {
      return reply.status(503).send({
        status: "blocked",
        service: "api",
        database: "unconfigured",
        migrations: "unknown"
      });
    }
    return { status: "ready", service: "api", database: "not_required", migrations: "not_required" };
  }

  try {
    const executor = createPostgresMigrationExecutor({
      mode: "postgres",
      postgresUrl: (process.env.POSTGRES_URL ?? process.env.DATABASE_URL) as string
    });
    await executor.query("SELECT 1");
    const applied = await listAppliedMigrations(executor);
    const appliedNames = new Set(applied.map((migration) => migration.name));
    const migrationsReady = databaseMigrations.every((migration) => appliedNames.has(migration.name));
    if (!migrationsReady) {
      return reply.status(503).send({
        status: "blocked",
        service: "api",
        database: "ok",
        migrations: "pending"
      });
    }
    return { status: "ready", service: "api", database: "ok", migrations: "ok" };
  } catch {
    return reply.status(503).send({
      status: "blocked",
      service: "api",
      database: "unavailable",
      migrations: "unknown"
    });
  }
});

server.get("/", async () => {
  return {
    name: "HallederizCRM-PREMIUM API",
    message: "Bootstrap is ready"
  };
});

async function bootstrap() {
  registerApiRateLimits(server);
  registerOriginGuard(server);
  await server.register(cors, buildApiCorsOptions());
  await registerPlatformCoreRoutes(server);
  await registerProductStockPricingRoutes(server);
  await registerSalesCrmRoutes(server);
  await registerCommercialOperationsRoutes(server);
  await registerArchiveRoutes(server);
  await registerOperationsEngineRoutes(server);
  await registerDashboardAnnouncementRoutes(server);
  await registerOperatorConsoleRoutes(server);
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
