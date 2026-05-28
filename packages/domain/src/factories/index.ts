import type { FactoryOrder, FactoryOrderLine, FactoryStockItem, FactoryStockSnapshot, IntegrationHealthSummary, SaleOrder } from "@hallederiz/types";

export function buildFactoryStockSummary(items: FactoryStockItem[]) {
  const totalAvailable = items.reduce((total, item) => total + item.availableQuantity, 0);
  const errorCount = items.filter((item) => item.integrationStatus === "error").length;
  const staleCount = items.filter((item) => !item.lastSyncedAt).length;
  return { itemCount: items.length, totalAvailable, errorCount, staleCount, status: errorCount > 0 ? "error" : staleCount > 0 ? "warning" : "healthy" as IntegrationHealthSummary["status"] };
}

export function groupFactoryOrderLines(lines: FactoryOrderLine[]): Record<string, FactoryOrderLine[]> {
  return lines.reduce<Record<string, FactoryOrderLine[]>>((groups, line) => {
    const key = line.productId;
    groups[key] = [...(groups[key] ?? []), line];
    return groups;
  }, {});
}

export function buildFactoryOrderFromSale(order: SaleOrder, factoryId: string, factoryName: string): FactoryOrder {
  const lines = order.lines
    .filter((line) => line.sourcePreference === "factory" || line.sourcePreference === "split")
    .map((line, index): FactoryOrderLine => ({ id: `factory_order_line_${order.id}_${index + 1}`, tenantId: order.tenantId, factoryOrderId: `factory_order_${order.id}`, saleOrderLineId: line.id, productId: line.productId, productCode: line.productCode, productName: line.productName, quantity: line.sourcePreference === "split" ? Math.max(1, Math.ceil(line.quantity / 2)) : line.quantity, note: "Siparis kaynak planindan olustu." }));
  return { id: `factory_order_${order.id}`, tenantId: order.tenantId, factoryOrderNo: `FO-${order.orderNo.replace(/\D/g, "") || order.id}`, factoryId, factoryName, saleOrderId: order.id, saleOrderNo: order.orderNo, status: "draft", lineCount: lines.length, lastUpdatedAt: new Date().toISOString(), lines };
}

export function buildFactoryHealthSummary(snapshots: FactoryStockSnapshot[]): IntegrationHealthSummary {
  const failed = snapshots.filter((snapshot) => snapshot.status === "failed").length;
  const stale = snapshots.filter((snapshot) => snapshot.status === "stale").length;
  return { status: failed > 0 ? "error" : stale > 0 ? "warning" : "healthy", activeConnectionCount: snapshots.length, warningCount: stale, errorCount: failed, lastSyncedAt: snapshots.map((snapshot) => snapshot.capturedAt).sort().at(-1), message: failed > 0 ? "Fabrika stok senkronunda hata var." : stale > 0 ? "Bazi fabrika snapshot kayitlari stale." : "Fabrika entegrasyonlari saglikli." };
}
