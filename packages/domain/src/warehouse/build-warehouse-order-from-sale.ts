import type { SaleOrder, WarehouseOrder } from "@hallederiz/types";
import { buildWarehouseTaskList } from "./build-warehouse-task-list";

export function buildWarehouseOrderFromSale(order: SaleOrder): WarehouseOrder {
  const warehouseLines = order.lines.filter((line) => line.sourcePreference !== "factory");
  const warehouseOrder: WarehouseOrder = {
    id: `warehouse_order_${order.id}`,
    tenantId: order.tenantId,
    warehouseOrderNo: `WO-${order.orderNo.replace(/\D/g, "") || order.id}`,
    orderId: order.id,
    orderNo: order.orderNo,
    customerId: order.customerId,
    warehouseId: "wh_1",
    warehouseName: "Merkez Depo",
    status: "waiting",
    dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    note: "Siparis kaynak planindan otomatik depo hazirlik emri taslagi.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lines: warehouseLines.map((line) => ({
      id: `warehouse_line_${line.id}`,
      warehouseOrderId: `warehouse_order_${order.id}`,
      orderLineId: line.id,
      productId: line.productId,
      productCode: line.productCode,
      productName: line.productName,
      requestedQuantity: line.sourcePreference === "split" ? Math.min(line.quantity, line.centerStockSnapshot) : line.quantity,
      preparedQuantity: line.preparedQuantity,
      warehouseId: "wh_1",
      warehouseName: "Merkez Depo",
      rackNo: undefined,
      locationCode: undefined
    })),
    tasks: []
  };

  return {
    ...warehouseOrder,
    tasks: buildWarehouseTaskList(warehouseOrder)
  };
}
