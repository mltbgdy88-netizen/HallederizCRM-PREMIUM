import type { OfferStatus } from "@hallederiz/types";

export interface OfferFilters {
  customerId: string;
  status: OfferStatus | "";
  dateRange: "all" | "today" | "week" | "month";
  followUpState: "all" | "planned" | "waiting" | "completed";
  convertedOnly: boolean;
}

export const defaultOfferFilters: OfferFilters = {
  customerId: "",
  status: "",
  dateRange: "all",
  followUpState: "all",
  convertedOnly: false
};
