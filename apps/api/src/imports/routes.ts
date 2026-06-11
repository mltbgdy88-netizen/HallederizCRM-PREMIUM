import type { FastifyInstance } from "fastify";
import type { ImportFilePayload, ImportType } from "@hallederiz/types";
import { ImportsService } from "../modules/imports/service";
import { assertAnyPermission, assertAuthenticated, withGuards } from "../shared/auth-guards";
import { recordAuditEvent } from "../shared/audit-timeline";

interface ImportParams {
  type: ImportType;
}

export async function registerImportRoutes(server: FastifyInstance) {
  server.get("/imports/templates", async (request, reply) => {
    return withGuards(
      request,
      reply,
      [assertAuthenticated, (context) => assertAnyPermission(context, ["settings.manage", "customers.read", "products.read"])],
      async (context) => {
        const service = new ImportsService(context);
        return { items: service.listTemplates() };
      }
    );
  });

  server.get<{ Params: ImportParams }>("/imports/templates/:type", async (request, reply) => {
    return withGuards(
      request,
      reply,
      [assertAuthenticated, (context) => assertAnyPermission(context, ["settings.manage", "customers.write", "products.write"])],
      async (context) => {
        const service = new ImportsService(context);
        const template = service.getTemplate(request.params.type);
        return {
          item: template,
          csv: service.getTemplateCsv(request.params.type)
        };
      }
    );
  });

  server.post<{ Params: ImportParams; Body: { file: ImportFilePayload } }>("/imports/:type/preview", async (request, reply) => {
    return withGuards(
      request,
      reply,
      [assertAuthenticated, (context) => assertAnyPermission(context, ["settings.manage", "customers.write", "products.write"])],
      async (context) => {
        const service = new ImportsService(context);
        const preview = await service.preview(request.params.type, request.body.file);
        recordAuditEvent(context, {
          entityType: "import",
          entityId: request.params.type,
          eventType: "import.preview",
          title: "Import onizleme olusturuldu",
          description: `${request.params.type} dosyasi icin onizleme olusturuldu.`
        });
        return { item: preview };
      }
    );
  });

  server.post<{ Params: ImportParams; Body: { file: ImportFilePayload } }>("/imports/:type/apply", async (request, reply) => {
    return withGuards(
      request,
      reply,
      [assertAuthenticated, (context) => assertAnyPermission(context, ["settings.manage", "customers.write", "products.write"])],
      async (context) => {
        const service = new ImportsService(context);
        const result = await service.apply(request.params.type, request.body.file);
        recordAuditEvent(context, {
          entityType: "import",
          entityId: result.importId,
          eventType: "import.apply",
          title: "Import calistirildi",
          description: `${request.params.type} import sonucu: ${result.successCount} basarili, ${result.errorCount} hatali.`
        });
        return { item: result };
      }
    );
  });

  server.get<{ Querystring: { type?: ImportType } }>("/imports/history", async (request, reply) => {
    return withGuards(
      request,
      reply,
      [assertAuthenticated, (context) => assertAnyPermission(context, ["settings.manage", "customers.read", "products.read"])],
      async (context) => {
        const service = new ImportsService(context);
        const items = service.listHistory(request.query.type);
        return { items, total: items.length };
      }
    );
  });

  server.get<{ Params: { id: string } }>("/imports/history/:id", async (request, reply) => {
    return withGuards(
      request,
      reply,
      [assertAuthenticated, (context) => assertAnyPermission(context, ["settings.manage", "customers.read", "products.read"])],
      async (context) => {
        const service = new ImportsService(context);
        const history = service.getHistoryById(request.params.id);
        if (!history) {
          return reply.status(404).send({ message: "Import gecmisi bulunamadi." });
        }
        return { item: history };
      }
    );
  });

  server.post<{ Params: { id: string } }>("/imports/history/:id/retry", async (request, reply) => {
    return withGuards(
      request,
      reply,
      [assertAuthenticated, (context) => assertAnyPermission(context, ["settings.manage", "customers.write", "products.write"])],
      async (context) => {
        const service = new ImportsService(context);
        const record = service.retryHistory(request.params.id);
        if (!record) {
          return reply.status(404).send({ message: "Import gecmisi bulunamadi." });
        }
        recordAuditEvent(context, {
          entityType: "import",
          entityId: record.id,
          eventType: "import.retry",
          title: "Import tekrar deneme isaretlendi",
          description: `${record.type} import kaydi yeniden deneme icin hazirlandi.`
        });
        return { item: record };
      }
    );
  });

  server.get<{ Params: { id: string } }>("/imports/history/:id/error-report", async (request, reply) => {
    return withGuards(
      request,
      reply,
      [assertAuthenticated, (context) => assertAnyPermission(context, ["settings.manage", "customers.read", "products.read"])],
      async (context) => {
        const service = new ImportsService(context);
        const history = service.getHistoryById(request.params.id);
        if (!history) {
          return reply.status(404).send({ message: "Import gecmisi bulunamadi." });
        }
        return { item: { id: history.id, errorReport: service.getErrorReport(history.id) } };
      }
    );
  });
}
