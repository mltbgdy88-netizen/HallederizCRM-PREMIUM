import type { FastifyInstance } from "fastify";
import { withGuards } from "../shared/auth-guards";
import { readPermissions, requireReadAccess } from "../shared/read-guards";
import { listPublishedAnnouncementVideosForTenant, toPublicVideo } from "./announcement-videos-store";
import { resolveTenantPlanCode, resolveTenantSlug } from "../operator/tenant-directory";

export async function registerDashboardAnnouncementRoutes(server: FastifyInstance) {
  server.get("/dashboard/announcement-videos", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.tasks), async (context) => {
      const tenantSlug = resolveTenantSlug(context.tenantId);
      const planCode = resolveTenantPlanCode(context.tenantId, tenantSlug);
      const items = listPublishedAnnouncementVideosForTenant({
        tenantId: context.tenantId,
        tenantSlug,
        planCode
      }).map(toPublicVideo);
      return { items, total: items.length };
    })
  );
}
