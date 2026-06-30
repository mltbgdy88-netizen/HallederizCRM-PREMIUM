import type { FastifyInstance } from "fastify";
import { assertAnyPermission, assertAuthenticated, withGuards } from "../shared/auth-guards";
import { readPermissions, requireReadAccess } from "../shared/read-guards";
import {
  createAnnouncementVideo,
  deleteAnnouncementVideo,
  listAllAnnouncementVideos,
  listPublishedAnnouncementVideos,
  toPublicVideo,
  updateAnnouncementVideo,
  type AnnouncementVideoInput
} from "./announcement-videos-store";

export async function registerDashboardAnnouncementRoutes(server: FastifyInstance) {
  server.get("/dashboard/announcement-videos", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.tasks), async (context) => {
      const items = listPublishedAnnouncementVideos(context.tenantId).map(toPublicVideo);
      return { items, total: items.length };
    })
  );

  server.get("/settings/announcement-videos", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.settings), async (context) => {
      const items = listAllAnnouncementVideos(context.tenantId);
      return { items, total: items.length };
    })
  );

  server.post<{ Body: AnnouncementVideoInput }>("/settings/announcement-videos", async (request, reply) =>
    withGuards(
      request,
      reply,
      [assertAuthenticated, (context) => assertAnyPermission(context, ["platform.settings.write", "settings.manage"])],
      async (context) => {
        const body = request.body;
        if (!body?.title?.trim() || !body?.videoUrl?.trim() || !body?.kind) {
          return reply.status(400).send({ message: "title, videoUrl ve kind zorunludur." });
        }
        const item = createAnnouncementVideo(context.tenantId, body);
        return reply.status(201).send({ item });
      }
    )
  );

  server.patch<{ Params: { id: string }; Body: Partial<AnnouncementVideoInput> }>(
    "/settings/announcement-videos/:id",
    async (request, reply) =>
      withGuards(
        request,
        reply,
        [assertAuthenticated, (context) => assertAnyPermission(context, ["platform.settings.write", "settings.manage"])],
        async (context) => {
          const item = updateAnnouncementVideo(context.tenantId, request.params.id, request.body ?? {});
          if (!item) {
            return reply.status(404).send({ message: "Video kaydı bulunamadı." });
          }
          return { item };
        }
      )
  );

  server.delete<{ Params: { id: string } }>("/settings/announcement-videos/:id", async (request, reply) =>
    withGuards(
      request,
      reply,
      [assertAuthenticated, (context) => assertAnyPermission(context, ["platform.settings.write", "settings.manage"])],
      async (context) => {
        const deleted = deleteAnnouncementVideo(context.tenantId, request.params.id);
        if (!deleted) {
          return reply.status(404).send({ message: "Video kaydı bulunamadı." });
        }
        return { ok: true };
      }
    )
  );
}
