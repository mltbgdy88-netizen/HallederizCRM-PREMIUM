import type { Delivery, SaleOrderStatus } from "@hallederiz/types";

export function deriveOrderCompletionState(deliveries: Delivery[]): SaleOrderStatus {
  if (deliveries.some((delivery) => delivery.status === "rolled_back" || delivery.status === "failed")) {
    return "ready";
  }

  if (deliveries.some((delivery) => delivery.status === "partially_delivered")) {
    return "partially_delivered";
  }

  if (deliveries.length > 0 && deliveries.every((delivery) => delivery.status === "delivered")) {
    return "delivered";
  }

  if (deliveries.some((delivery) => delivery.status === "ready")) {
    return "ready";
  }

  return "in_preparation";
}
