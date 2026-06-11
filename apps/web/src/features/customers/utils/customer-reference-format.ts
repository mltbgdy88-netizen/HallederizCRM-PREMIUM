import { resolveCustomerDisplayType } from "@hallederiz/domain";
import type { Customer, CustomerAccount } from "@hallederiz/types";

export function customerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function formatCustomerMoney(amount: number, currency = "TRY"): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
}

export function formatCustomerDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" });
}

export function formatCustomerDateOnly(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("tr-TR");
}

export function customerStatusLabel(customer: Customer): string {
  return customer.active ? "Aktif" : "Pasif";
}

export function customerGroupLabel(customer: Customer): string {
  return resolveCustomerDisplayType(customer.type);
}

export function customerPriceGroupLabel(customer: Customer): string {
  return customer.pricingProfile.priceSlotLabelSnapshot ?? `Slot ${customer.pricingProfile.selectedPriceSlotNo}`;
}

export function creditUsageRatio(account: CustomerAccount): number | null {
  if (!account.creditLimit || account.creditLimit <= 0) return null;
  return Math.min(100, Math.max(0, (account.balance / account.creditLimit) * 100));
}

export function formatPercent(value: number): string {
  return `%${value.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}`;
}
