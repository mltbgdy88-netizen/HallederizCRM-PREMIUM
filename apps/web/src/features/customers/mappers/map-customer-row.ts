import { calculateCustomerRiskState, resolveCustomerDisplayType } from "@hallederiz/domain";
import type { Customer, CustomerAccount } from "@hallederiz/types";

export interface CustomerRow {
  customerId: string;
  code: string;
  name: string;
  typeLabel: string;
  phone: string;
  city: string;
  balanceLabel: string;
  riskLabel: string;
  riskTone: "success" | "warning" | "danger";
  priceGroupLabel: string;
  lastOrderLabel: string;
}

function formatMoney(amount: number, currency: string): string {
  return `${amount.toLocaleString("tr-TR")} ${currency}`;
}

function riskTone(level: string): CustomerRow["riskTone"] {
  if (level === "high" || level === "blocked") {
    return "danger";
  }

  if (level === "medium") {
    return "warning";
  }

  return "success";
}

export function mapCustomerToRow(customer: Customer, account: CustomerAccount): CustomerRow {
  const risk = calculateCustomerRiskState(customer, account);

  return {
    customerId: customer.id,
    code: customer.code,
    name: customer.name,
    typeLabel: resolveCustomerDisplayType(customer.type),
    phone: customer.phone,
    city: customer.city,
    balanceLabel: formatMoney(account.balance, account.currency),
    riskLabel: risk.label,
    riskTone: riskTone(risk.level),
    priceGroupLabel: customer.pricingProfile.priceSlotLabelSnapshot ?? `Slot ${customer.pricingProfile.selectedPriceSlotNo}`,
    lastOrderLabel: customer.lastOrderAt ? new Date(customer.lastOrderAt).toLocaleDateString("tr-TR") : "-"
  };
}
