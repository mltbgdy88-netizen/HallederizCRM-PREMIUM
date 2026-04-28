import type { PaymentMethod, PaymentStatus } from "@hallederiz/types";

export interface PaymentFilters {
  customer: string;
  method: "all" | PaymentMethod;
  status: "all" | PaymentStatus;
  dateRange: "all" | "today" | "week" | "month";
  documentType: "all" | "order" | "invoice" | "open_account";
  openOnly: boolean;
}

export const defaultPaymentFilters: PaymentFilters = {
  customer: "",
  method: "all",
  status: "all",
  dateRange: "all",
  documentType: "all",
  openOnly: false
};
