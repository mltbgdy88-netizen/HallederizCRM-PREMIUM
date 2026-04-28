import type { CustomerType } from "@hallederiz/types";

const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  bayi: "Bayi",
  perakende: "Perakende",
  mimar: "Mimar",
  usta: "Usta",
  kurumsal: "Kurumsal",
  ozel: "Ozel"
};

export function resolveCustomerDisplayType(type: CustomerType): string {
  return CUSTOMER_TYPE_LABELS[type] ?? "Ozel";
}
