import type { FastifyInstance } from "fastify";
import { assertAnyPermission, assertAuthenticated, withGuards } from "../../shared/auth-guards";
import { evaluateProductionReadiness } from "../../shared/production-readiness-runtime";

const readinessReadPermissions = ["settings.read", "platform.settings.read", "admin.readiness.read"] as const;

export async function registerProductionReadinessRoutes(server: FastifyInstance) {
  server.get("/platform/production-readiness", async (request, reply) =>
    withGuards(
      request,
      reply,
      [assertAuthenticated, (context) => assertAnyPermission(context, readinessReadPermissions)],
      async (context) => {
        const report = await evaluateProductionReadiness(context);
        return {
          ok: report.overallStatus === "ready",
          tenantId: context.tenantId,
          ...report
        };
      }
    )
  );
}

