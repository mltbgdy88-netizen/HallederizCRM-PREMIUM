import type { FastifyInstance } from "fastify";
import type { QuickOperationSubmitRequest } from "@hallederiz/types";
import { QuickOperationsService } from "../modules/quick-operations/service";
import { assertAnyPermission, assertAuthenticated, withGuards } from "../shared/auth-guards";

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
        const service = new QuickOperationsService(context);
        return { item: await service.submitQuickOperation(request.body) };
      }
    )
  );
}
