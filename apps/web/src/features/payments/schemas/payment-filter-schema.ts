import type { PaymentMethod, PaymentStatus } from "@hallederiz/types";

export type CustomerGroupFilter = "all" | "bayi" | "kurumsal" | "mimar" | "perakende";

export interface PaymentFilters {
  customer: string;
  method: "all" | PaymentMethod;
  dateRange: "all" | "today" | "week" | "month";
  customerGroup: CustomerGroupFilter;
  status: "all" | PaymentStatus;
}

export const defaultPaymentFilters: PaymentFilters = {
  customer: "",
  method: "all",
  dateRange: "all",
  customerGroup: "all",
  status: "all"
};
