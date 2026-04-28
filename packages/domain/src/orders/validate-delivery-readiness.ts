import type { SaleOrder, WarehouseOrder } from "@hallederiz/types";

export function validateDeliveryReadiness(order: SaleOrder, warehouseOrders: WarehouseOrder[] = []): { ready: boolean; blockers: string[] } {
  const blockers: string[] = [];

  if (order.paymentStatus === "unpaid") {
    blockers.push("Tahsilat henuz baslamadi.");
  }

  if (order.status === "cancelled") {
    blockers.push("Iptal edilen siparis teslimata cikamaz.");
  }

  const hasWarehouseLines = order.lines.some((line) => line.sourcePreference !== "factory");
  const warehousePrepared = warehouseOrders.some((warehouseOrder) => warehouseOrder.orderId === order.id && warehouseOrder.status === "prepared");

  if (hasWarehouseLines && !warehousePrepared) {
    blockers.push("Depo hazirlik emri tamamlanmadi.");
  }

  if (order.lines.some((line) => line.sourcePreference === "factory" && line.factoryStockSnapshot < line.quantity)) {
    blockers.push("Fabrika kaynakli satir icin stok veya siparis teyidi bekleniyor.");
  }

  return {
    ready: blockers.length === 0,
    blockers
  };
}
