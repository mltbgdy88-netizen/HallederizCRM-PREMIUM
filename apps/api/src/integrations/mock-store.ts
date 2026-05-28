import type { ErpConnection, ErpMapping, ErpSyncLog, FactoryIntegration, FactoryOrder, FactoryStockItem, IntegrationHealthSummary, WhatsAppActionRequest, WhatsAppConversation, WhatsAppMessage, WhatsAppTemplate } from "@hallederiz/types";

const tenantId = "tenant_1";
const now = "2026-04-28T12:00:00.000Z";

const whatsappConversations: WhatsAppConversation[] = [
  { id: "wa_conv_1", tenantId, contactId: "wa_contact_1", title: "Aydin Dekor", lastMessagePreview: "Siparis durumu ve belge talebi", intent: "siparis", unreadCount: 0, pendingActionCount: 0, relatedCustomerId: "customer_1", relatedOrderId: "order_1", updatedAt: now, ruleResolution: { intent: "siparis", allowed: true, policyMode: "approval_required", requiresRegisteredPhone: true, requiresCustomerLink: true, reason: "Siparis intent'i approval zincirine baglanir." } }
];
const whatsappMessages: WhatsAppMessage[] = [
  { id: "wa_msg_1", tenantId, conversationId: "wa_conv_1", direction: "inbound", type: "text", body: "SO-2481 ne durumda?", sentAt: now, status: "received" }
];
const whatsappTemplates: WhatsAppTemplate[] = [
  { id: "wa_tpl_1", tenantId, code: "ORDER_STATUS", name: "Siparis Durumu", type: "dealer_self_service", intent: "siparis", body: "Siparis durumunuz kontrol edildi.", active: true }
];
const whatsappActionRequests: WhatsAppActionRequest[] = [];

const erpConnections: ErpConnection[] = [
  { id: "erp_conn_1", tenantId, name: "ERP Merkez API", type: "api", mode: "bidirectional", status: "healthy", lastSyncedAt: now, lastTestResult: "success", active: true },
  { id: "erp_conn_2", tenantId, name: "Excel Aktarim", type: "excel", mode: "export_only", status: "warning", lastTestResult: "not_tested", active: true }
];
const erpMappings: ErpMapping[] = [
  { id: "erp_map_1", tenantId, connectionId: "erp_conn_1", entityType: "customer", localField: "customer.code", remoteField: "CARIKOD", active: true }
];
const erpLogs: ErpSyncLog[] = [
  { id: "erp_log_1", tenantId, connectionId: "erp_conn_1", direction: "import", entityType: "stock", status: "success", recordCount: 312, message: "Mock senkron tamamlandi.", startedAt: now, finishedAt: now }
];
const erpTemplates = ["cari import", "urun import", "stok import", "fiyat import", "tahsilat export", "siparis export"];

const factories = [
  { id: "factory_1", tenantId, code: "ANK", name: "Ankara Fabrika", active: true },
  { id: "factory_2", tenantId, code: "IZM", name: "Izmir Fabrika", active: true }
];
const factoryIntegrations: FactoryIntegration[] = [
  { id: "factory_int_1", tenantId, factoryId: "factory_1", name: "Ankara API", type: "api", status: "active", lastHealthCheckAt: now, lastSyncAt: now },
  { id: "factory_int_2", tenantId, factoryId: "factory_2", name: "Izmir Excel", type: "excel", status: "error", lastHealthCheckAt: now, errorMessage: "Kolon eslesmesi eksik" }
];
const factoryStocks: FactoryStockItem[] = [
  { id: "factory_stock_1", tenantId, snapshotId: "snapshot_1", factoryId: "factory_1", productId: "prod_1", productCode: "DK-1001", productName: "Linen Soft Ivory", availableQuantity: 420, reservedQuantity: 12, lastSyncedAt: now, integrationStatus: "active" },
  { id: "factory_stock_2", tenantId, snapshotId: "snapshot_2", factoryId: "factory_2", productId: "prod_2", productCode: "DK-2022", productName: "Geo Line Ash", availableQuantity: 168, reservedQuantity: 8, lastSyncedAt: "2026-04-28T05:30:00.000Z", integrationStatus: "error" }
];
const factoryOrders: FactoryOrder[] = [
  { id: "factory_order_1", tenantId, factoryOrderNo: "FO-221", factoryId: "factory_1", factoryName: "Ankara Fabrika", saleOrderId: "order_1", saleOrderNo: "SO-2481", status: "sent", lineCount: 1, lastUpdatedAt: now, lines: [{ id: "fo_line_1", tenantId, factoryOrderId: "factory_order_1", productId: "prod_2", productCode: "DK-2022", productName: "Geo Line Ash", quantity: 18 }] }
];
const factoryHealth: IntegrationHealthSummary = { status: "warning", activeConnectionCount: 2, warningCount: 0, errorCount: 1, lastSyncedAt: now, message: "Bir fabrika entegrasyonunda hata var." };

export function listWhatsAppConversations() { return whatsappConversations; }
export function getWhatsAppConversation(id: string) { return { conversation: whatsappConversations.find((item) => item.id === id), messages: whatsappMessages.filter((item) => item.conversationId === id) }; }
export function receiveWhatsAppInbound(body: Partial<WhatsAppMessage>) {
  const message: WhatsAppMessage = {
    id: `wa_msg_${whatsappMessages.length + 1}`,
    tenantId,
    conversationId: body.conversationId ?? "wa_conv_1",
    direction: "inbound",
    type: body.type ?? "text",
    body: body.body ?? "",
    attachmentTitle: body.attachmentTitle,
    quotedMessageId: body.quotedMessageId,
    sentAt: now,
    status: "received"
  };
  whatsappMessages.push(message);
  return message;
}

export function sendWhatsAppOutbound(body: Partial<WhatsAppMessage>) {
  const message: WhatsAppMessage = {
    id: `wa_msg_${whatsappMessages.length + 1}`,
    tenantId,
    conversationId: body.conversationId ?? "wa_conv_1",
    direction: "outbound",
    type: body.type ?? "text",
    body: body.body ?? "",
    attachmentTitle: body.attachmentTitle,
    quotedMessageId: body.quotedMessageId,
    sentAt: now,
    status: "queued"
  };
  whatsappMessages.push(message);
  return message;
}
export function createWhatsAppActionRequest(body: Partial<WhatsAppActionRequest>) { const request = { ...body, id: `wa_action_${whatsappActionRequests.length + 1}`, tenantId, status: "pending", createdAt: now } as WhatsAppActionRequest; whatsappActionRequests.push(request); return request; }
export function updateWhatsAppActionRequest(id: string, status: WhatsAppActionRequest["status"]) { const request = whatsappActionRequests.find((item) => item.id === id); if (!request) return null; request.status = status; return request; }
export function listWhatsAppTemplates() { return whatsappTemplates; }

export function listErpConnections() { return erpConnections; }
export function getErpConnection(id: string) { return erpConnections.find((item) => item.id === id); }
export function createErpConnection(body: Partial<ErpConnection>) { const connection = { ...erpConnections[0], ...body, id: `erp_conn_${erpConnections.length + 1}` } as ErpConnection; erpConnections.push(connection); return connection; }
export function patchErpConnection(id: string, body: Partial<ErpConnection>) { const connection = getErpConnection(id); if (!connection) return null; Object.assign(connection, body); return connection; }
export function testErpConnection(id: string) { const connection = getErpConnection(id); if (!connection) return null; connection.lastTestResult = "success"; return connection; }
export function syncErpConnection(id: string) { const connection = getErpConnection(id); if (!connection) return null; connection.lastSyncedAt = now; return { connection, log: erpLogs[0] }; }
export function listErpMappings() { return erpMappings; }
export function patchErpMappings(body: ErpMapping[]) { erpMappings.splice(0, erpMappings.length, ...body); return erpMappings; }
export function listErpLogs() { return erpLogs; }
export function listErpTemplates() { return erpTemplates; }

export function listFactories() { return factories; }
export function listFactoryStocks(factoryId: string) { return factoryStocks.filter((item) => item.factoryId === factoryId); }
export function syncFactoryStock(factoryId: string) { return { factoryId, syncedAt: now, items: listFactoryStocks(factoryId).length }; }
export function listFactoryOrders() { return factoryOrders; }
export function getFactoryOrder(id: string) { return factoryOrders.find((item) => item.id === id || item.factoryOrderNo === id); }
export function createFactoryOrder(body: Partial<FactoryOrder>) { const order = { ...factoryOrders[0], ...body, id: `factory_order_${factoryOrders.length + 1}`, factoryOrderNo: body.factoryOrderNo ?? `FO-${factoryOrders.length + 300}` } as FactoryOrder; factoryOrders.push(order); return order; }
export function updateFactoryOrderStatus(id: string, status: FactoryOrder["status"]) { const order = getFactoryOrder(id); if (!order) return null; order.status = status; order.lastUpdatedAt = now; return order; }
export function getFactoryIntegrationHealth() { return { health: factoryHealth, integrations: factoryIntegrations }; }
