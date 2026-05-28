import type { Customer, WarehouseOrder } from "@hallederiz/types";
import { dateLabel } from "../utils";
import { getPrepDisplayStatus, getWarehouseOrderPrepLabel } from "../utils/warehouse-prep-status";

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
  const prep = getPrepDisplayStatus(warehouseOrder);
  if (prep === "iptal") return "neutral";
  if (prep === "teslim_edildi") return "success";
  if (prep === "hazirlandi") return "success";
  if (prep === "eksik") return "danger";
  if (prep === "beklemede") return "warning";
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
    statusLabel: getWarehouseOrderPrepLabel(warehouseOrder),
    statusTone: resolveTone(warehouseOrder),
    dueAtLabel: dateLabel(warehouseOrder.dueAt)
  };
}
