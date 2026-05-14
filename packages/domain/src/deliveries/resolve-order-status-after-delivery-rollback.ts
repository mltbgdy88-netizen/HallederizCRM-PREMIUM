import type { SaleOrderStatus } from "@hallederiz/types";

/** Teslimat rollback sonrasi siparis `status` alaninin nasil guncellenecegi (commercial-core ile uyumlu). */
export function resolveOrderStatusAfterDeliveryRollback(currentStatus: SaleOrderStatus): SaleOrderStatus {
  return currentStatus === "completed" ? "partially_delivered" : currentStatus;
}
