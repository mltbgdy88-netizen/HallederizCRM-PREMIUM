import type { FastifyInstance } from "fastify";
import type { ErpConnection, ErpMapping, FactoryOrder, WhatsAppActionRequest, WhatsAppMessage } from "@hallederiz/types";
import { IntegrationsService } from "../modules/integrations/service";
import { assertAnyPermission, assertAuthenticated, withGuards } from "../shared/auth-guards";

export async function registerIntegrationRoutes(server: FastifyInstance) {
  server.get("/whatsapp/conversations", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async (context) => {
      const service = new IntegrationsService(context);
      const items = service.listWhatsAppConversations();
      return { items, total: items.length };
    })
  );

  server.get<{ Params: { id: string } }>("/whatsapp/conversations/:id", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async (context) => {
      const service = new IntegrationsService(context);
      const conversation = service.getWhatsAppConversation(request.params.id);
      if (!conversation.conversation) return reply.status(404).send({ message: "Conversation not found" });
      return { item: conversation };
    })
  );

  server.post<{ Body: Partial<WhatsAppMessage> }>("/whatsapp/inbound", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["integrations.write", "whatsapp.write"])], async (context) => {
      const service = new IntegrationsService(context);
      return reply.status(201).send({ item: service.receiveWhatsAppInbound(request.body) });
    })
  );

  server.post<{ Body: Partial<WhatsAppMessage> }>("/whatsapp/outbound", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["integrations.write", "whatsapp.write"])], async (context) => {
      const service = new IntegrationsService(context);
      return reply.status(201).send({ item: service.sendWhatsAppOutbound(request.body) });
    })
  );

  server.post<{ Body: Partial<WhatsAppActionRequest> }>("/whatsapp/action-requests", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["integrations.write", "approvals.write"])], async (context) => {
      const service = new IntegrationsService(context);
      return reply.status(201).send({ item: service.createWhatsAppActionRequest(request.body) });
    })
  );

  server.post<{ Params: { id: string } }>("/whatsapp/action-requests/:id/confirm", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["integrations.write", "approvals.write"])], async (context) => {
      const service = new IntegrationsService(context);
      const item = service.confirmWhatsAppActionRequest(request.params.id);
      if (!item) return reply.status(404).send({ message: "Action request not found" });
      return { item };
    })
  );

  server.post<{ Params: { id: string } }>("/whatsapp/action-requests/:id/reject", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["integrations.write", "approvals.write"])], async (context) => {
      const service = new IntegrationsService(context);
      const item = service.rejectWhatsAppActionRequest(request.params.id);
      if (!item) return reply.status(404).send({ message: "Action request not found" });
      return { item };
    })
  );

  server.get("/whatsapp/templates", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async (context) => {
      const service = new IntegrationsService(context);
      return { items: service.listWhatsAppTemplates() };
    })
  );

  server.get("/erp/connections", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async (context) => {
      const service = new IntegrationsService(context);
      const items = service.listErpConnections();
      return { items, total: items.length };
    })
  );

  server.get<{ Params: { id: string } }>("/erp/connections/:id", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async (context) => {
      const service = new IntegrationsService(context);
      const item = service.getErpConnection(request.params.id);
      if (!item) return reply.status(404).send({ message: "ERP connection not found" });
      return { item };
    })
  );

  server.post<{ Body: Partial<ErpConnection> }>("/erp/connections", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["integrations.write", "erp.write"])], async (context) => {
      const service = new IntegrationsService(context);
      return reply.status(201).send({ item: service.createErpConnection(request.body) });
    })
  );

  server.patch<{ Params: { id: string }; Body: Partial<ErpConnection> }>("/erp/connections/:id", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["integrations.write", "erp.write"])], async (context) => {
      const service = new IntegrationsService(context);
      const item = service.patchErpConnection(request.params.id, request.body);
      if (!item) return reply.status(404).send({ message: "ERP connection not found" });
      return { item };
    })
  );

  server.post<{ Params: { id: string } }>("/erp/connections/:id/test", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["integrations.write", "erp.write"])], async (context) => {
      const service = new IntegrationsService(context);
      const item = service.testErpConnection(request.params.id);
      if (!item) return reply.status(404).send({ message: "ERP connection not found" });
      return { item };
    })
  );

  server.post<{ Params: { id: string } }>("/erp/connections/:id/sync", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["integrations.write", "erp.write"])], async (context) => {
      const service = new IntegrationsService(context);
      const item = service.syncErpConnection(request.params.id);
      if (!item) return reply.status(404).send({ message: "ERP connection not found" });
      return { item };
    })
  );

  server.get("/erp/mappings", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async (context) => {
      const service = new IntegrationsService(context);
      return { items: service.listErpMappings() };
    })
  );

  server.patch<{ Body: ErpMapping[] }>("/erp/mappings", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["integrations.write", "erp.write"])], async (context) => {
      const service = new IntegrationsService(context);
      return { items: service.patchErpMappings(request.body) };
    })
  );

  server.get("/erp/logs", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async (context) => {
      const service = new IntegrationsService(context);
      return { items: service.listErpLogs() };
    })
  );

  server.get("/erp/templates", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async (context) => {
      const service = new IntegrationsService(context);
      return { items: service.listErpTemplates() };
    })
  );

  server.get("/factories", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async (context) => {
      const service = new IntegrationsService(context);
      return { items: service.listFactories() };
    })
  );

  server.get<{ Params: { id: string } }>("/factories/:id/stocks", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async (context) => {
      const service = new IntegrationsService(context);
      return { items: service.listFactoryStocks(request.params.id) };
    })
  );

  server.post<{ Params: { id: string } }>("/factories/:id/sync-stock", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["integrations.write", "factory.write"])], async (context) => {
      const service = new IntegrationsService(context);
      return { item: service.syncFactoryStock(request.params.id) };
    })
  );

  server.get("/factory-orders", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async (context) => {
      const service = new IntegrationsService(context);
      const items = service.listFactoryOrders();
      return { items, total: items.length };
    })
  );

  server.get<{ Params: { id: string } }>("/factory-orders/:id", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async (context) => {
      const service = new IntegrationsService(context);
      const item = service.getFactoryOrder(request.params.id);
      if (!item) return reply.status(404).send({ message: "Factory order not found" });
      return { item };
    })
  );

  server.post<{ Body: Partial<FactoryOrder> }>("/factory-orders", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["integrations.write", "factory.write", "orders.write"])], async (context) => {
      const service = new IntegrationsService(context);
      return reply.status(201).send({ item: service.createFactoryOrder(request.body) });
    })
  );

  server.post<{ Params: { id: string } }>("/factory-orders/:id/send", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["integrations.write", "factory.write"])], async (context) => {
      const service = new IntegrationsService(context);
      const item = service.sendFactoryOrder(request.params.id);
      if (!item) return reply.status(404).send({ message: "Factory order not found" });
      return { item };
    })
  );

  server.post<{ Params: { id: string } }>("/factory-orders/:id/confirm", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["integrations.write", "factory.write"])], async (context) => {
      const service = new IntegrationsService(context);
      const item = service.confirmFactoryOrder(request.params.id);
      if (!item) return reply.status(404).send({ message: "Factory order not found" });
      return { item };
    })
  );

  server.post<{ Params: { id: string } }>("/factory-orders/:id/mark-shipped", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["integrations.write", "factory.write"])], async (context) => {
      const service = new IntegrationsService(context);
      const item = service.markFactoryOrderShipped(request.params.id);
      if (!item) return reply.status(404).send({ message: "Factory order not found" });
      return { item };
    })
  );

  server.post<{ Params: { id: string } }>("/factory-orders/:id/complete", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["integrations.write", "factory.write"])], async (context) => {
      const service = new IntegrationsService(context);
      const item = service.completeFactoryOrder(request.params.id);
      if (!item) return reply.status(404).send({ message: "Factory order not found" });
      return { item };
    })
  );

  server.get("/integrations/factories/health", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async (context) => {
      const service = new IntegrationsService(context);
      return { item: service.getFactoryIntegrationHealth() };
    })
  );
}
