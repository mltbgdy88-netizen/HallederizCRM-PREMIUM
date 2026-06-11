import type { FastifyInstance } from "fastify";
import type { QuickOperationSubmitRequest } from "@hallederiz/types";
import { QuickOperationsService } from "../modules/quick-operations/service";
import { assertAnyPermission, assertAuthenticated, withGuards } from "../shared/auth-guards";
import { recordAuditEvent } from "../shared/audit-timeline";
import {
  checkIdempotency,
  resolveIdempotencyKeyFromHeader,
  storeIdempotencyResult
} from "../shared/idempotency-store";

const IDEMPOTENCY_SCOPE = "quick-operations.submit";

export async function registerQuickOperationsRoutes(server: FastifyInstance) {
  server.post<{ Body: QuickOperationSubmitRequest }>("/quick-operations/preview", async (request, reply) =>
    withGuards(
      request,
      reply,
      [assertAuthenticated, (context) => assertAnyPermission(context, ["orders.write", "offers.write", "payments.write"])],
      async (context) => {
        const service = new QuickOperationsService(context);
        return { item: service.previewQuickOperation(request.body) };
      }
    )
  );

  server.post<{ Body: QuickOperationSubmitRequest }>("/quick-operations/submit", async (request, reply) =>
    withGuards(
      request,
      reply,
      [assertAuthenticated, (context) => assertAnyPermission(context, ["orders.write", "offers.write", "payments.write"])],
      async (context) => {
        const idempotencyKey = resolveIdempotencyKeyFromHeader(request.headers["idempotency-key"]);
        if (!idempotencyKey) {
          return reply.status(400).send({
            message: "Idempotency-Key basligi zorunludur.",
            reason: "idempotency_key_required"
          });
        }

        const idempotencyCheck = await checkIdempotency(context, IDEMPOTENCY_SCOPE, idempotencyKey, request.body);
        if (idempotencyCheck.type === "conflict") {
          return reply.status(409).send({
            message: "Ayni Idempotency-Key farkli istek govdesi ile kullanilamaz.",
            reason: "idempotency_key_conflict"
          });
        }
        if (idempotencyCheck.type === "replay") {
          return { item: idempotencyCheck.body };
        }

        const service = new QuickOperationsService(context);
        const item = await service.submitQuickOperation(request.body, idempotencyKey);
        await storeIdempotencyResult(context, IDEMPOTENCY_SCOPE, idempotencyKey, request.body, item);

        const auditEvent = recordAuditEvent(context, {
          entityType: "quick_operation",
          entityId: item.createdEntityId ?? item.draftId ?? idempotencyKey,
          eventType: "quick_operations.submit",
          title: "Hizli islem gonderildi",
          description: `${item.operationType} islemi ${item.mode} modunda islendi.`,
          payload: {
            operationType: item.operationType,
            mode: item.mode,
            ok: item.ok,
            idempotencyKey
          }
        });
        item.auditEventIds = [...(item.auditEventIds ?? []), auditEvent.id];

        return { item };
      }
    )
  );
}
