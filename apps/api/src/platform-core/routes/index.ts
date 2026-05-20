import type { FastifyInstance } from "fastify";
import { registerApprovalRoutes, type ApprovalRouteDeps } from "./approval-routes";
import { registerAuthRoutes } from "./auth-routes";
import { registerOmnichannelRoutes } from "./omnichannel-routes";
import { registerOmnichannelWebhookRoutes } from "./omnichannel-webhook-routes";
import { registerRoleRoutes } from "./role-routes";
import { registerSettingsRoutes } from "./settings-routes";
import { registerUserRoutes } from "./user-routes";
import { registerWorkerRoutes, type WorkerRouteDeps } from "./worker-routes";
import { registerUsageRoutes } from "./usage-routes";
import { registerProductionReadinessRoutes } from "./production-readiness-routes";
import { registerAiSalesRoutes } from "./ai-sales-routes";

export interface PlatformCoreRouteDeps {
  approvalRoutes?: ApprovalRouteDeps;
  workerRoutes?: WorkerRouteDeps;
}

export async function registerPlatformCoreRoutes(server: FastifyInstance, deps: PlatformCoreRouteDeps = {}) {
  await registerAuthRoutes(server);
  await registerUserRoutes(server);
  await registerRoleRoutes(server);
  await registerSettingsRoutes(server);
  await registerApprovalRoutes(server, deps.approvalRoutes);
  await registerWorkerRoutes(server, deps.workerRoutes);
  await registerUsageRoutes(server);
  await registerAiSalesRoutes(server);
  await registerOmnichannelRoutes(server);
  await registerOmnichannelWebhookRoutes(server);
  await registerProductionReadinessRoutes(server);
}
