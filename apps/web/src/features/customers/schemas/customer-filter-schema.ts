import type { CustomerBalanceState, CustomerRiskLevel, CustomerType, PriceSlotNumber } from "@hallederiz/types";

export type CustomerWhatsappFilter = "all" | "matched" | "unmatched";

export interface CustomerFilters {
  searchText: string;
  customerType: CustomerType | "";
  city: string;
  riskLevel: CustomerRiskLevel | "";
  balanceState: CustomerBalanceState;
  activeState: "all" | "active" | "inactive";
  priceSlotNo: PriceSlotNumber | "";
  whatsappMatch: CustomerWhatsappFilter;
}

export const defaultCustomerFilters: CustomerFilters = {
  searchText: "",
  customerType: "",
  city: "",
  riskLevel: "",
  balanceState: "all",
  activeState: "all",
  priceSlotNo: "",
  whatsappMatch: "all"
};
