import type { Customer } from "@hallederiz/types";

export function customerRiskLabelFromProfile(customer: Customer): { label: string; description: string } {
  switch (customer.riskLevel) {
    case "blocked":
      return { label: "Blokeli", description: "Cari için satış onayı zorunlu." };
    case "high":
      return { label: "Yüksek", description: "Risk profili yüksek; işlemlerde ek onay gerekebilir." };
    case "medium":
      return { label: "Orta", description: "Risk profili orta; bakiye takibi önerilir." };
    default:
      return { label: "Düşük", description: "Finans özeti bağlandığında detaylı risk hesaplanır." };
  }
}
