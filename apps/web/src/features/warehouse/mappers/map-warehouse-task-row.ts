import type { Customer, WarehouseOrder } from "@hallederiz/types";
import { dateLabel } from "../utils";
import { getWarehouseOrderStatusLabel } from "../queries/warehouse-mock-data";

export interface WarehouseTaskRow {
  warehouseOrderId: string;
  taskNo: string;
  orderNo: string;
  customerName: string;
  productCountLabel: string;
  warehouseName: string;
  statusLabel: string;
  statusTone: "info" | "success" | "warning" | "danger" | "neutral";
  dueAtLabel: string;
}

function resolveTone(warehouseOrder: WarehouseOrder): WarehouseTaskRow["statusTone"] {
  if (warehouseOrder.status === "cancelled") {
    return "danger";
  }

  if (warehouseOrder.status === "prepared" || warehouseOrder.status === "delivered") {
    return "success";
  }

  if (warehouseOrder.tasks.some((task) => task.critical)) {
    return "warning";
  }

  return "info";
}

export function mapWarehouseTaskRow(warehouseOrder: WarehouseOrder, customers: Customer[]): WarehouseTaskRow {
  return {
    warehouseOrderId: warehouseOrder.id,
    taskNo: warehouseOrder.warehouseOrderNo,
    orderNo: warehouseOrder.orderNo,
    customerName: customers.find((customer) => customer.id === warehouseOrder.customerId)?.name ?? warehouseOrder.customerId,
    productCountLabel: String(warehouseOrder.lines.length),
    warehouseName: warehouseOrder.warehouseName,
    statusLabel: getWarehouseOrderStatusLabel(warehouseOrder.status),
    statusTone: resolveTone(warehouseOrder),
    dueAtLabel: dateLabel(warehouseOrder.dueAt)
  };
}
