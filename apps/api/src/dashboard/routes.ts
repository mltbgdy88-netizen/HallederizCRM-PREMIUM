import type { FastifyInstance } from "fastify";
import { withGuards } from "../shared/auth-guards";
import { readPermissions, requireReadAccess } from "../shared/read-guards";
import { toPublicVideo } from "./announcement-videos-store";
import { listPublishedAnnouncementVideosForTenant } from "./announcement-videos-service";
import { resolveTenantPlanCode, resolveTenantSlug } from "../operator/tenant-directory";

export async function registerDashboardAnnouncementRoutes(server: FastifyInstance) {
  server.get("/dashboard/announcement-videos", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.tasks), async (context) => {
      const tenantSlug = await resolveTenantSlug(context.tenantId);
      const planCode = await resolveTenantPlanCode(context.tenantId, tenantSlug);
      const items = (await listPublishedAnnouncementVideosForTenant({
        tenantId: context.tenantId,
        tenantSlug,
        planCode
      })).map(toPublicVideo);
      return { items, total: items.length };
    })
  );
}
