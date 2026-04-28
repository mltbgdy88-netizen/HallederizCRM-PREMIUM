import type { SaleOrderStatus } from "@hallederiz/types";

const allowedTransitions: Record<SaleOrderStatus, SaleOrderStatus[]> = {
  draft: ["confirmed", "cancelled"],
  confirmed: ["waiting_stock", "in_preparation", "cancelled"],
  waiting_stock: ["in_preparation", "cancelled"],
  in_preparation: ["ready", "cancelled"],
  ready: ["partially_delivered", "delivered", "cancelled"],
  partially_delivered: ["delivered", "cancelled"],
  delivered: ["completed"],
  completed: [],
  cancelled: []
};

export function validateOrderTransition(from: SaleOrderStatus, to: SaleOrderStatus): { valid: boolean; reason?: string } {
  if (from === to) {
    return { valid: true };
  }

  if (allowedTransitions[from].includes(to)) {
    return { valid: true };
  }

  return {
    valid: false,
    reason: `${from} durumundan ${to} durumuna gecis icin workflow veya yetkili onayi gerekir.`
  };
}
