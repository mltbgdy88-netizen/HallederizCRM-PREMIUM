import type { PaymentAllocationSummary, PaymentReceipt, PaymentStatus } from "@hallederiz/types";

function resolveAllocationStatus(paymentAmount: number, allocatedTotal: number, currentStatus: PaymentStatus): PaymentStatus {
  if (currentStatus === "reversed") {
    return "reversed";
  }

  if (allocatedTotal <= 0) {
    return currentStatus === "confirmed" ? "confirmed" : "draft";
  }

  if (allocatedTotal < paymentAmount) {
    return "partially_allocated";
  }

  return "allocated";
}

export function buildPaymentAllocationSummary(payment: PaymentReceipt): PaymentAllocationSummary {
  const allocatedTotal = payment.allocations.reduce((total, allocation) => total + allocation.allocatedAmount, 0);

  return {
    paymentAmount: payment.amount,
    allocatedTotal,
    remainingAmount: Number((payment.amount - allocatedTotal).toFixed(2)),
    allocationCount: payment.allocations.length,
    status: resolveAllocationStatus(payment.amount, allocatedTotal, payment.status)
  };
}
