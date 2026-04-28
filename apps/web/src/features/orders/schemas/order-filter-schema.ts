import type { OrderChannel, OrderDeliveryStatus, OrderPaymentStatus, OrderSourcePreference, SaleOrderStatus } from "@hallederiz/types";

export interface OrderFilters {
  customer: string;
  status: "all" | SaleOrderStatus;
  paymentStatus: "all" | OrderPaymentStatus;
  deliveryStatus: "all" | OrderDeliveryStatus;
  channel: "all" | OrderChannel;
  sourceType: "all" | OrderSourcePreference;
  openOperationsOnly: boolean;
}

export const defaultOrderFilters: OrderFilters = {
  customer: "",
  status: "all",
  paymentStatus: "all",
  deliveryStatus: "all",
  channel: "all",
  sourceType: "all",
  openOperationsOnly: false
};
