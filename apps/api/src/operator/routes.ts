import type { FastifyInstance } from "fastify";
import {
  createPlatformAnnouncementVideo,
  deletePlatformAnnouncementVideo,
  listAllPlatformAnnouncementVideos,
  updatePlatformAnnouncementVideo,
  type PlatformAnnouncementVideoInput
} from "../dashboard/announcement-videos-store";
import { withGuards } from "../shared/auth-guards";
import { assertPlatformOperatorRead, assertPlatformOperatorWrite } from "../shared/operator-guards";
import { listOperatorTenants } from "./tenant-directory";

export async function registerOperatorConsoleRoutes(server: FastifyInstance) {
  server.get("/operator/tenants", async (request, reply) =>
    withGuards(request, reply, [assertPlatformOperatorRead], async () => {
      const items = listOperatorTenants();
      return { items, total: items.length };
    })
  );

  server.get("/operator/announcement-videos", async (request, reply) =>
    withGuards(request, reply, [assertPlatformOperatorRead], async () => {
      const items = listAllPlatformAnnouncementVideos();
      return { items, total: items.length };
    })
  );

  server.post<{ Body: PlatformAnnouncementVideoInput }>("/operator/announcement-videos", async (request, reply) =>
    withGuards(request, reply, [assertPlatformOperatorWrite], async () => {
      const body = request.body;
      if (!body?.title?.trim() || !body?.videoUrl?.trim() || !body?.kind || !body?.targetMode) {
        return reply.status(400).send({ message: "title, videoUrl, kind ve targetMode zorunludur." });
      }
      const item = createPlatformAnnouncementVideo(body);
      return reply.status(201).send({ item });
    })
  );

  server.patch<{ Params: { id: string }; Body: Partial<PlatformAnnouncementVideoInput> }>(
    "/operator/announcement-videos/:id",
    async (request, reply) =>
      withGuards(request, reply, [assertPlatformOperatorWrite], async () => {
        const item = updatePlatformAnnouncementVideo(request.params.id, request.body ?? {});
        if (!item) {
          return reply.status(404).send({ message: "Video kaydı bulunamadı." });
        }
        return { item };
      })
  );

  server.delete<{ Params: { id: string } }>("/operator/announcement-videos/:id", async (request, reply) =>
    withGuards(request, reply, [assertPlatformOperatorWrite], async () => {
      const deleted = deletePlatformAnnouncementVideo(request.params.id);
      if (!deleted) {
        return reply.status(404).send({ message: "Video kaydı bulunamadı." });
      }
      return { ok: true };
    })
  );
}
