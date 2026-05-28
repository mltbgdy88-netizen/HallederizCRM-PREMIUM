import type { FastifyInstance } from "fastify";
import { assertAnyPermission, assertAuthenticated, withGuards } from "../../shared/auth-guards";
import { listEntityTimeline } from "../../shared/entity-timeline-service";
import { readPermissions, requireReadAccess } from "../../shared/read-guards";

export async function registerTimelineRoutes(server: FastifyInstance) {
  server.get<{ Querystring: { entityType?: string; entityId?: string } }>("/timeline", async (request, reply) =>
    withGuards(
      request,
      reply,
      [
        assertAuthenticated,
        (context) =>
          assertAnyPermission(context, [
            ...readPermissions.customers,
            ...readPermissions.documents,
            ...readPermissions.payments,
            ...readPermissions.orders,
            "approvals.read"
          ])
      ],
      async (context) => {
      const entityType = request.query.entityType?.trim();
      const entityId = request.query.entityId?.trim();
      if (!entityType || !entityId) {
        return reply.status(400).send({
          ok: false,
          message: "Kayıt bilgisi eksik."
        });
      }

      const result = await listEntityTimeline(context, entityType, entityId);
      return {
        items: result.items,
        total: result.items.length,
        persistenceMode: result.mode
      };
      }
    )
  );

  server.get<{ Querystring: { entityType?: string; entityId?: string } }>("/audit-timeline", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async (context) => {
      const entityType = request.query.entityType?.trim();
      const entityId = request.query.entityId?.trim();
      if (!entityType || !entityId) {
        return reply.status(400).send({
          ok: false,
          message: "Kayıt bilgisi eksik."
        });
      }
      const result = await listEntityTimeline(context, entityType, entityId);
      return {
        items: result.items,
        total: result.items.length
      };
    })
  );
}
