import { resolveCustomerDisplayType } from "@hallederiz/domain";
import type { Customer, CustomerAccount, CustomerContact, CustomerLedgerEntry } from "@hallederiz/types";
import { formatTryMoney, formatTrDate, formatTrDateTime } from "../../../lib/reference/formatters";
import { mapCustomerToRow } from "../../customers/mappers/map-customer-row";
import type { CkmHeaderData } from "../data/cariler-katman-mock";

export function customerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function buildKatmanHeader(
  customer: Customer,
  account: CustomerAccount | null,
  primaryContact: CustomerContact | null,
  breadcrumbSuffix: string
): CkmHeaderData {
  const row = mapCustomerToRow(customer, account);
  const contactName = primaryContact?.fullName ?? customer.name;

  return {
    breadcrumb: ["Cariler", breadcrumbSuffix],
    initials: customerInitials(customer.name),
    title: customer.name,
    status: customer.active === false ? "Pasif" : "Aktif",
    meta: [
      { label: "Cari Kodu", value: customer.code },
      { label: "Vergi No", value: customer.taxNumber || "—" },
      { label: "Cari Grubu", value: resolveCustomerDisplayType(customer.type) },
      { label: "Yetkili", value: contactName }
    ],
    contact: [
      { label: "Telefon", value: customer.phone || "—" },
      { label: "E-posta", value: customer.email || "—" },
      { label: "Bakiye", value: row.balanceLabel }
    ]
  };
}

export function creditUsagePercent(account: CustomerAccount | null): number {
  if (!account?.creditLimit || account.creditLimit <= 0) return 0;
  return Math.min(100, Math.round((Math.abs(account.balance) / account.creditLimit) * 10000) / 100);
}

export function formatUsagePct(pct: number): string {
  return `%${pct.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function ledgerToTimelineType(entry: CustomerLedgerEntry): string {
  if (entry.referenceType === "payment") return "Ödeme";
  if (entry.referenceType === "order") return "Sipariş";
  return "Not";
}

export function ledgerToTimelineTone(entry: CustomerLedgerEntry): string {
  if (entry.referenceType === "payment") return "ok";
  if (entry.referenceType === "order") return "info";
  return "green";
}

export function formatLedgerTimelineTime(iso: string): string {
  return formatTrDateTime(iso);
}

export function formatLedgerTimelineGroup(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) return "Bugün";
  const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  if (d.getTime() >= weekAgo) return "Bu Hafta";
  return "Daha Önce";
}

export { formatTryMoney, formatTrDate, formatTrDateTime };

