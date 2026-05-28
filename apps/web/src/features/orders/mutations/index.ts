import type { SaleOrder } from "@hallederiz/types";
import { createOrderRecord, updateOrderRecord } from "../../../services/api/orders.service";

export async function createOrderMutation(payload: Partial<SaleOrder>) {
  return createOrderRecord(payload);
}

export async function updateOrderMutation(orderId: string, payload: Partial<SaleOrder>) {
  return updateOrderRecord(orderId, payload);
}
