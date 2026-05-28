import type { SaleOrder } from "@hallederiz/types";

export interface DeliveryPaymentPolicy {
  blockDeliveryWhenPaymentMissing: boolean;
  requireApprovalWhenPartial: boolean;
}

export const defaultDeliveryPaymentPolicy: DeliveryPaymentPolicy = {
  blockDeliveryWhenPaymentMissing: false,
  requireApprovalWhenPartial: true
};

export function validateDeliveryPaymentRule(order: SaleOrder, policy: DeliveryPaymentPolicy = defaultDeliveryPaymentPolicy) {
  const paymentMissing = order.paymentStatus === "unpaid" || order.paymentStatus === "partial";
  const blockers: string[] = [];

  if (paymentMissing && policy.blockDeliveryWhenPaymentMissing) {
    blockers.push("Tenant politikasina gore eksik odemeli siparis teslim edilemez.");
  }

  return {
    paymentMissing,
    approvalRequired: paymentMissing && policy.requireApprovalWhenPartial,
    valid: blockers.length === 0,
    blockers
  };
}
