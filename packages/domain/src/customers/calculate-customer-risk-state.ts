import type { Customer, CustomerAccount, CustomerRiskLevel } from "@hallederiz/types";

export interface CustomerRiskState {
  level: CustomerRiskLevel;
  label: string;
  description: string;
  requiresApproval: boolean;
}

export function calculateCustomerRiskState(customer: Customer, account: CustomerAccount): CustomerRiskState {
  if (customer.riskLevel === "blocked") {
    return {
      level: "blocked",
      label: "Blokeli",
      description: "Cari icin satis onayi zorunlu.",
      requiresApproval: true
    };
  }

  if (account.creditLimit && account.balance > account.creditLimit) {
    return {
      level: "high",
      label: "Yuksek",
      description: "Bakiye kredi limitini asiyor.",
      requiresApproval: true
    };
  }

  if (account.overdueAmount > 0 || customer.riskLevel === "high") {
    return {
      level: "high",
      label: "Yuksek",
      description: "Gecikmis bakiye veya yuksek risk sinyali var.",
      requiresApproval: true
    };
  }

  if (customer.riskLevel === "medium" || account.balance > 0) {
    return {
      level: "medium",
      label: "Orta",
      description: "Acik bakiye takip edilmeli.",
      requiresApproval: false
    };
  }

  return {
    level: "low",
    label: "Dusuk",
    description: "Finansal risk sinyali dusuk.",
    requiresApproval: false
  };
}
