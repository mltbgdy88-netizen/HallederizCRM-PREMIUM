import type { FastifyInstance } from "fastify";
import type { ArchiveSourceType } from "@hallederiz/types";
import { ArchiveService } from "./archive-service";
import { withGuards } from "../../shared/auth-guards";
import { readPermissions, requireReadAccess } from "../../shared/read-guards";

export async function registerArchiveRoutes(server: FastifyInstance) {
  server.get<{
    Querystring: {
      page?: string;
      pageSize?: string;
      customerId?: string;
      sourceType?: ArchiveSourceType;
      status?: string;
    };
  }>("/archive", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.documents), async (context) => {
      const service = new ArchiveService(context);
      const result = service.listArchive({
        page: request.query.page ? Number(request.query.page) : undefined,
        pageSize: request.query.pageSize ? Number(request.query.pageSize) : undefined,
        customerId: request.query.customerId,
        sourceType: request.query.sourceType,
        status: request.query.status as never
      });

      if (!result.liveReady && context.persistenceMode === "postgres") {
        return reply.status(503).send({
          message: "Arşiv kayıtları şu anda alınamıyor.",
          items: [],
          total: 0,
          liveReady: false
        });
      }

      return result;
    })
  );

  server.get<{ Params: { id: string } }>("/archive/:id", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.documents), async (context) => {
      const service = new ArchiveService(context);
      const item = service.getArchive(request.params.id);
      if (!item) {
        return reply.status(404).send({ message: "Arşiv kaydı bulunamadı." });
      }
      return { item, liveReady: service.isLiveReady() };
    })
  );

  server.get<{ Params: { id: string } }>("/archive/:id/download-url", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.documents), async (context) => {
        const service = new ArchiveService(context);
        const resolved = service.resolveArchiveDownloadLink(request.params.id);
        if (resolved.status === 404) {
          return reply.status(404).send({ message: "Arşiv dosyası henüz hazır değil." });
        }
        if (resolved.status === 200) {
          return { item: resolved.item };
        }
        return reply.status(202).send({ item: resolved.item });
      }
    )
  );
}
