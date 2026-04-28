import { buildFactoryHealthSummary, buildFactoryOrderFromSale } from "@hallederiz/domain";
import type { FactoryIntegration, FactoryOrder, FactoryStockItem, FactoryStockSnapshot, IntegrationLog } from "@hallederiz/types";
import { getOrderMockData } from "../../orders/queries/order-mock-data";
import { getStockCatalog } from "../../stock/queries/get-stock-catalog";

const tenantId = "tenant_1";

export const factoryIntegrations: FactoryIntegration[] = [
  { id: "factory_int_1", tenantId, factoryId: "factory_1", name: "Ankara Fabrika API", type: "api", status: "active", lastHealthCheckAt: "2026-04-28T09:50:00.000Z", lastSyncAt: "2026-04-28T09:45:00.000Z" },
  { id: "factory_int_2", tenantId, factoryId: "factory_2", name: "Izmir Excel Stok", type: "excel", status: "error", lastHealthCheckAt: "2026-04-28T08:30:00.000Z", lastSyncAt: "2026-04-28T05:30:00.000Z", errorMessage: "Excel dosyasinda kolon eslesmesi eksik." }
];

export async function getFactoryStockData() {
  const catalog = await getStockCatalog();
  const items: FactoryStockItem[] = catalog.products.flatMap((product, index) => {
    const factory = catalog.factories.find((item) => item.id === product.factoryId) ?? catalog.factories[0];
    const integration = factoryIntegrations.find((item) => item.factoryId === factory?.id);
    return [{ id: `factory_stock_${product.id}`, tenantId, snapshotId: `factory_snapshot_${factory?.id}`, factoryId: factory?.id ?? "factory_1", productId: product.id, productCode: product.code, productName: product.name, availableQuantity: product.factoryStockSummary.totalStock, reservedQuantity: index * 4, lastSyncedAt: product.factoryStockSummary.lastSyncedAt ?? undefined, integrationStatus: integration?.status ?? "passive" }];
  });
  const snapshots: FactoryStockSnapshot[] = catalog.factories.map((factory) => {
    const factoryItems = items.filter((item) => item.factoryId === factory.id);
    return { id: `factory_snapshot_${factory.id}`, tenantId, factoryId: factory.id, integrationId: factoryIntegrations.find((item) => item.factoryId === factory.id)?.id ?? "manual", capturedAt: factoryItems.map((item) => item.lastSyncedAt).filter(Boolean).sort().at(-1) ?? "2026-04-28T05:30:00.000Z", itemCount: factoryItems.length, status: factoryItems.some((item) => item.integrationStatus === "error") ? "failed" : factoryItems.some((item) => !item.lastSyncedAt) ? "stale" : "synced", items: factoryItems };
  });
  return { factories: catalog.factories, brands: catalog.brands, integrations: factoryIntegrations, items, snapshots, health: buildFactoryHealthSummary(snapshots) };
}

export async function getFactoryOrderData(): Promise<{ orders: FactoryOrder[]; logs: IntegrationLog[] }> {
  const saleOrders = await getOrderMockData();
  const firstOrder = saleOrders[0];
  const secondOrder = saleOrders[1] ?? saleOrders[0];

  if (!firstOrder || !secondOrder) {
    return { orders: [], logs: [] };
  }

  const first = buildFactoryOrderFromSale(firstOrder, "factory_1", "Ankara Fabrika");
  const second = buildFactoryOrderFromSale(secondOrder, "factory_2", "Izmir Fabrika");
  const orders: FactoryOrder[] = [
    { ...first, id: "factory_order_1", factoryOrderNo: "FO-221", status: "sent", lastUpdatedAt: "2026-04-28T10:40:00.000Z", lineCount: Math.max(first.lines.length, 1), lines: first.lines.length ? first.lines.map((line) => ({ ...line, factoryOrderId: "factory_order_1" })) : [{ id: "fo_line_1", tenantId, factoryOrderId: "factory_order_1", productId: "prod_2", productCode: "DK-2022", productName: "Geo Line Ash", quantity: 18, note: "Split kaynak" }] },
    { ...second, id: "factory_order_2", factoryOrderNo: "FO-214", status: "producing", lastUpdatedAt: "2026-04-28T08:20:00.000Z", lineCount: Math.max(second.lines.length, 1), lines: second.lines.length ? second.lines.map((line) => ({ ...line, factoryOrderId: "factory_order_2" })) : [{ id: "fo_line_2", tenantId, factoryOrderId: "factory_order_2", productId: "prod_3", productCode: "DK-3308", productName: "Concrete Mist", quantity: 42, note: "Fabrika stok teyidi" }] }
  ];
  const logs: IntegrationLog[] = [
    { id: "factory_log_1", tenantId, integrationType: "factory", integrationId: "factory_int_1", level: "info", message: "FO-221 API ile fabrikaya gonderildi.", createdAt: "2026-04-28T10:40:00.000Z", entityType: "factory_order", entityId: "factory_order_1" },
    { id: "factory_log_2", tenantId, integrationType: "factory", integrationId: "factory_int_2", level: "warning", message: "FO-214 durum guncellemesi Excel fallback ile alindi.", createdAt: "2026-04-28T08:20:00.000Z", entityType: "factory_order", entityId: "factory_order_2" }
  ];
  return { orders, logs };
}

export async function getFactoryOrderById(factoryOrderId?: string) {
  const data = await getFactoryOrderData();
  return { order: data.orders.find((item) => item.id === factoryOrderId || item.factoryOrderNo === factoryOrderId) ?? data.orders[0] ?? null, logs: data.logs };
}
