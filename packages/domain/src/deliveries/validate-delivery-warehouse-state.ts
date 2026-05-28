import type { Delivery, WarehouseOrder } from "@hallederiz/types";

export function validateDeliveryWarehouseState(delivery: Delivery, warehouseOrders: WarehouseOrder[]) {
  const linkedWarehouseOrder = warehouseOrders.find((warehouseOrder) => warehouseOrder.id === delivery.warehouseOrderId || warehouseOrder.orderId === delivery.orderId);
  const warehouseReady = Boolean(linkedWarehouseOrder && linkedWarehouseOrder.status === "prepared");
  const blockers = warehouseReady ? [] : ["Depo hazirlik emri henuz hazirlandi durumunda degil."];

  return {
    warehouseReady,
    linkedWarehouseOrder,
    valid: blockers.length === 0,
    blockers
  };
}
