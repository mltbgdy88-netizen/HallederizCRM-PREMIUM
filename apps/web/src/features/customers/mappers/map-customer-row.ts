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
  balanceCreditLine: string;
  balanceDebitLine: string;
  riskLabel: string;
  riskTone: "success" | "warning" | "danger";
  priceGroupLabel: string;
  lastOrderLabel: string;
  whatsappMatched: boolean;
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
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
  const b = account.balance;
  const cur = account.currency;
  const balanceCreditLine = b > 0 ? `${formatMoney(b, cur)} alacak` : "—";
  const balanceDebitLine = b < 0 ? `${formatMoney(-b, cur)} verecek` : b === 0 ? "Bakiye sıfır" : "—";

  return {
    customerId: customer.id,
    code: customer.code,
    name: customer.name,
    typeLabel: resolveCustomerDisplayType(customer.type),
    phone: customer.phone,
    city: customer.city,
    balanceLabel: formatMoney(b, cur),
    balanceCreditLine,
    balanceDebitLine,
    riskLabel: risk.label,
    riskTone: riskTone(risk.level),
    priceGroupLabel: customer.pricingProfile.priceSlotLabelSnapshot ?? `Slot ${customer.pricingProfile.selectedPriceSlotNo}`,
    lastOrderLabel: customer.lastOrderAt ? new Date(customer.lastOrderAt).toLocaleDateString("tr-TR") : "—",
    whatsappMatched: customer.whatsappMatched
  };
}
