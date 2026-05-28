import type { OrderPaymentStatus, PaymentAllocation, SaleOrder } from "@hallederiz/types";

export function deriveOrderPaymentStatus(
  order: Pick<SaleOrder, "id" | "grandTotal" | "paidTotal">,
  allocations: PaymentAllocation[] = []
): OrderPaymentStatus {
  const allocatedTotal =
    allocations.length > 0
      ? allocations.filter((allocation) => allocation.targetId === order.id).reduce((total, allocation) => total + allocation.allocatedAmount, 0)
      : order.paidTotal;

  if (allocatedTotal <= 0) {
    return "unpaid";
  }

  if (allocatedTotal > order.grandTotal) {
    return "overpaid";
  }

  if (allocatedTotal >= order.grandTotal) {
    return "paid";
  }

  return "partial";
}
