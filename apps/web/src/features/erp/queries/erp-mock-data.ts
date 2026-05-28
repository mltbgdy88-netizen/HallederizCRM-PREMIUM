import { buildErpSyncPreview, buildIntegrationHealthSummary } from "@hallederiz/domain";
import type { ErpConnection, ErpMapping, ErpSyncLog } from "@hallederiz/types";

const tenantId = "tenant_1";

export const erpConnections: ErpConnection[] = [
  { id: "erp_conn_1", tenantId, name: "ERP Merkez API", type: "api", mode: "bidirectional", status: "healthy", baseUrl: "https://erp.example.local/api", lastSyncedAt: "2026-04-28T09:40:00.000Z", lastTestResult: "success", active: true },
  { id: "erp_conn_2", tenantId, name: "Muhasebe Excel Aktarim", type: "excel", mode: "export_only", status: "warning", lastSyncedAt: "2026-04-27T17:10:00.000Z", lastTestResult: "not_tested", active: true },
  { id: "erp_conn_3", tenantId, name: "Eski ERP Test", type: "api", mode: "import_only", status: "passive", lastTestResult: "failed", active: false }
];

export const erpMappings: ErpMapping[] = [
  { id: "erp_map_1", tenantId, connectionId: "erp_conn_1", entityType: "customer", localField: "customer.code", remoteField: "CARIKOD", active: true },
  { id: "erp_map_2", tenantId, connectionId: "erp_conn_1", entityType: "product", localField: "product.code", remoteField: "STOKKOD", active: true },
  { id: "erp_map_3", tenantId, connectionId: "erp_conn_1", entityType: "invoice", localField: "invoice.invoiceNo", remoteField: "FATNO", active: true },
  { id: "erp_map_4", tenantId, connectionId: "erp_conn_2", entityType: "payment", localField: "payment.receiptNo", remoteField: "FIS_NO", active: true },
  { id: "erp_map_5", tenantId, connectionId: "erp_conn_2", entityType: "order", localField: "order.orderNo", remoteField: "SIP_NO", active: false }
];

export const erpSyncLogs: ErpSyncLog[] = [
  { id: "erp_log_1", tenantId, connectionId: "erp_conn_1", direction: "import", entityType: "stock", status: "success", recordCount: 312, message: "Stok import tamamlandi.", startedAt: "2026-04-28T09:30:00.000Z", finishedAt: "2026-04-28T09:40:00.000Z" },
  { id: "erp_log_2", tenantId, connectionId: "erp_conn_1", direction: "export", entityType: "invoice", status: "success", recordCount: 8, message: "Fatura export tamamlandi.", startedAt: "2026-04-28T08:10:00.000Z", finishedAt: "2026-04-28T08:12:00.000Z" },
  { id: "erp_log_3", tenantId, connectionId: "erp_conn_2", direction: "export", entityType: "payment", status: "warning", recordCount: 19, message: "2 satir manuel kontrol bekliyor.", startedAt: "2026-04-27T17:00:00.000Z", finishedAt: "2026-04-27T17:10:00.000Z" }
];

export const erpTemplates = [
  { key: "customer_import", title: "Cari Import", entityType: "customer", lastUsedAt: "2026-04-20" },
  { key: "product_import", title: "Urun Import", entityType: "product", lastUsedAt: "2026-04-21" },
  { key: "stock_import", title: "Stok Import", entityType: "stock", lastUsedAt: "2026-04-28" },
  { key: "price_import", title: "Fiyat Import", entityType: "price", lastUsedAt: "2026-04-25" },
  { key: "payment_export", title: "Tahsilat Export", entityType: "payment", lastUsedAt: "2026-04-27" },
  { key: "order_export", title: "Siparis Export", entityType: "order", lastUsedAt: "2026-04-26" }
];

export function getErpIntegrationData() {
  const health = buildIntegrationHealthSummary(erpConnections);
  const previews = erpConnections.map((connection) => buildErpSyncPreview({ connection, mappings: erpMappings, direction: connection.mode === "import_only" ? "import" : "export" }));
  return { connections: erpConnections, mappings: erpMappings, logs: erpSyncLogs, templates: erpTemplates, health, previews };
}
