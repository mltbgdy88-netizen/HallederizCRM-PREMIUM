import type { FastifyInstance } from "fastify";
import type { TenantUsageEventType } from "@hallederiz/domain";
import { assertAnyPermission, assertAuthenticated, withGuards } from "../../shared/auth-guards";
import { resolveTenantUsageLedger } from "../../shared/tenant-usage-runtime";

const usageReadPermissions = ["billing.read", "platform.settings.read", "reports.read"] as const;
const usageWritePermissions = ["billing.write", "platform.settings.write", "reports.write"] as const;

export async function registerUsageRoutes(server: FastifyInstance) {
  server.post<{
    Body: {
      tenantId?: string;
      eventType?: TenantUsageEventType;
      source?: string;
      quantity?: number;
      unit?: string;
      metadata?: Record<string, unknown>;
      occurredAt?: string;
    };
  }>("/platform/tenant-usage/events", async (request, reply) =>
    withGuards(
      request,
      reply,
      [assertAuthenticated, (context) => assertAnyPermission(context, usageWritePermissions)],
      async (context) => {
        const { eventType, source, quantity, unit, metadata, occurredAt } = request.body ?? {};
        if (!eventType || !source || typeof quantity !== "number" || !unit) {
          return reply.status(400).send({
            message: "eventType, source, quantity ve unit alanlari zorunludur."
          });
        }

        const resolution = resolveTenantUsageLedger(context);
        if (!resolution.ledger) {
          return reply.status(503).send({
            ok: false,
            message: "Tenant usage ledger persistence is unavailable.",
            usagePersistenceMode: resolution.mode,
            usagePersistenceSkipped: resolution.skipped,
            reasons: resolution.reasons
          });
        }

        try {
          const item = await resolution.ledger.record({
            tenantId: context.tenantId,
            eventType,
            source,
            quantity,
            unit,
            metadata,
            occurredAt
          });
          return {
            item,
            usagePersistenceMode: resolution.mode,
            usagePersistenceSkipped: resolution.skipped
          };
        } catch (error) {
          return reply.status(503).send({
            ok: false,
            message: "Tenant usage ledger persistence failed.",
            usagePersistenceMode: resolution.mode,
            usagePersistenceSkipped: resolution.skipped,
            reasons: [error instanceof Error ? error.message : String(error)]
          });
        }
      }
    )
  );

  server.get<{
    Querystring: { from?: string; to?: string; eventType?: TenantUsageEventType; source?: string };
  }>("/platform/tenant-usage/summary", async (request, reply) =>
    withGuards(
      request,
      reply,
      [assertAuthenticated, (context) => assertAnyPermission(context, usageReadPermissions)],
      async (context) => {
        const resolution = resolveTenantUsageLedger(context);
        if (!resolution.ledger) {
          return reply.status(503).send({
            ok: false,
            message: "Tenant usage ledger persistence is unavailable.",
            usagePersistenceMode: resolution.mode,
            usagePersistenceSkipped: resolution.skipped,
            reasons: resolution.reasons
          });
        }

        try {
          const item = await resolution.ledger.summarize({
            tenantId: context.tenantId,
            from: request.query.from,
            to: request.query.to,
            eventType: request.query.eventType,
            source: request.query.source
          });
          return {
            item,
            usagePersistenceMode: resolution.mode,
            usagePersistenceSkipped: resolution.skipped
          };
        } catch (error) {
          return reply.status(503).send({
            ok: false,
            message: "Tenant usage ledger persistence failed.",
            usagePersistenceMode: resolution.mode,
            usagePersistenceSkipped: resolution.skipped,
            reasons: [error instanceof Error ? error.message : String(error)]
          });
        }
      }
    )
  );
}
