import type { FastifyInstance } from "fastify";
import type { ErpConnection, ErpMapping, FactoryOrder, WhatsAppActionRequest, WhatsAppMessage } from "@hallederiz/types";
import { createErpConnection, createFactoryOrder, createWhatsAppActionRequest, getErpConnection, getFactoryIntegrationHealth, getFactoryOrder, getWhatsAppConversation, listErpConnections, listErpLogs, listErpMappings, listErpTemplates, listFactories, listFactoryOrders, listFactoryStocks, listWhatsAppConversations, listWhatsAppTemplates, patchErpConnection, patchErpMappings, receiveWhatsAppInbound, sendWhatsAppOutbound, syncErpConnection, syncFactoryStock, testErpConnection, updateFactoryOrderStatus, updateWhatsAppActionRequest } from "./mock-store";

export async function registerIntegrationRoutes(server: FastifyInstance) {
  server.get("/whatsapp/conversations", async () => ({ items: listWhatsAppConversations(), total: listWhatsAppConversations().length }));
  server.get<{ Params: { id: string } }>("/whatsapp/conversations/:id", async (request, reply) => {
    const conversation = getWhatsAppConversation(request.params.id);
    if (!conversation.conversation) return reply.status(404).send({ message: "Conversation not found" });
    return { item: conversation };
  });
  server.post<{ Body: Partial<WhatsAppMessage> }>("/whatsapp/inbound", async (request, reply) => reply.status(201).send({ item: receiveWhatsAppInbound(request.body) }));
  server.post<{ Body: Partial<WhatsAppMessage> }>("/whatsapp/outbound", async (request, reply) => reply.status(201).send({ item: sendWhatsAppOutbound(request.body) }));
  server.post<{ Body: Partial<WhatsAppActionRequest> }>("/whatsapp/action-requests", async (request, reply) => reply.status(201).send({ item: createWhatsAppActionRequest(request.body) }));
  server.post<{ Params: { id: string } }>("/whatsapp/action-requests/:id/confirm", async (request, reply) => {
    const item = updateWhatsAppActionRequest(request.params.id, "confirmed");
    if (!item) return reply.status(404).send({ message: "Action request not found" });
    return { item };
  });
  server.post<{ Params: { id: string } }>("/whatsapp/action-requests/:id/reject", async (request, reply) => {
    const item = updateWhatsAppActionRequest(request.params.id, "rejected");
    if (!item) return reply.status(404).send({ message: "Action request not found" });
    return { item };
  });
  server.get("/whatsapp/templates", async () => ({ items: listWhatsAppTemplates() }));

  server.get("/erp/connections", async () => ({ items: listErpConnections(), total: listErpConnections().length }));
  server.get<{ Params: { id: string } }>("/erp/connections/:id", async (request, reply) => {
    const item = getErpConnection(request.params.id);
    if (!item) return reply.status(404).send({ message: "ERP connection not found" });
    return { item };
  });
  server.post<{ Body: Partial<ErpConnection> }>("/erp/connections", async (request, reply) => reply.status(201).send({ item: createErpConnection(request.body) }));
  server.patch<{ Params: { id: string }; Body: Partial<ErpConnection> }>("/erp/connections/:id", async (request, reply) => {
    const item = patchErpConnection(request.params.id, request.body);
    if (!item) return reply.status(404).send({ message: "ERP connection not found" });
    return { item };
  });
  server.post<{ Params: { id: string } }>("/erp/connections/:id/test", async (request, reply) => {
    const item = testErpConnection(request.params.id);
    if (!item) return reply.status(404).send({ message: "ERP connection not found" });
    return { item };
  });
  server.post<{ Params: { id: string } }>("/erp/connections/:id/sync", async (request, reply) => {
    const item = syncErpConnection(request.params.id);
    if (!item) return reply.status(404).send({ message: "ERP connection not found" });
    return { item };
  });
  server.get("/erp/mappings", async () => ({ items: listErpMappings() }));
  server.patch<{ Body: ErpMapping[] }>("/erp/mappings", async (request) => ({ items: patchErpMappings(request.body) }));
  server.get("/erp/logs", async () => ({ items: listErpLogs() }));
  server.get("/erp/templates", async () => ({ items: listErpTemplates() }));

  server.get("/factories", async () => ({ items: listFactories() }));
  server.get<{ Params: { id: string } }>("/factories/:id/stocks", async (request) => ({ items: listFactoryStocks(request.params.id) }));
  server.post<{ Params: { id: string } }>("/factories/:id/sync-stock", async (request) => ({ item: syncFactoryStock(request.params.id) }));
  server.get("/factory-orders", async () => ({ items: listFactoryOrders(), total: listFactoryOrders().length }));
  server.get<{ Params: { id: string } }>("/factory-orders/:id", async (request, reply) => {
    const item = getFactoryOrder(request.params.id);
    if (!item) return reply.status(404).send({ message: "Factory order not found" });
    return { item };
  });
  server.post<{ Body: Partial<FactoryOrder> }>("/factory-orders", async (request, reply) => reply.status(201).send({ item: createFactoryOrder(request.body) }));
  server.post<{ Params: { id: string } }>("/factory-orders/:id/send", async (request, reply) => {
    const item = updateFactoryOrderStatus(request.params.id, "sent");
    if (!item) return reply.status(404).send({ message: "Factory order not found" });
    return { item };
  });
  server.post<{ Params: { id: string } }>("/factory-orders/:id/confirm", async (request, reply) => {
    const item = updateFactoryOrderStatus(request.params.id, "confirmed");
    if (!item) return reply.status(404).send({ message: "Factory order not found" });
    return { item };
  });
  server.post<{ Params: { id: string } }>("/factory-orders/:id/mark-shipped", async (request, reply) => {
    const item = updateFactoryOrderStatus(request.params.id, "shipped");
    if (!item) return reply.status(404).send({ message: "Factory order not found" });
    return { item };
  });
  server.post<{ Params: { id: string } }>("/factory-orders/:id/complete", async (request, reply) => {
    const item = updateFactoryOrderStatus(request.params.id, "completed");
    if (!item) return reply.status(404).send({ message: "Factory order not found" });
    return { item };
  });
  server.get("/integrations/factories/health", async () => ({ item: getFactoryIntegrationHealth() }));
}
