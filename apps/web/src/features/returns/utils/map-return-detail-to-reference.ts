import { calculateReturnImpact } from "@hallederiz/domain";
import type { Customer, Return, ReturnReasonCategory } from "@hallederiz/types";
import { getReturnStatusLabel } from "../queries/return-mock-data";
import { dateLabel } from "../../orders/utils/format";

export type ReturnReferenceKpi = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "success" | "warning";
};

export type ReturnWindowEvaluation = "expired" | "ok" | "unknown";

function reasonCategoryLabel(category?: ReturnReasonCategory): string {
  if (!category) return "—";
  const labels: Record<ReturnReasonCategory, string> = {
    damaged: "Hasar",
    wrong_product: "Yanlış ürün",
    quality: "Kalite",
    customer_request: "Müşteri talebi",
    other: "Diğer"
  };
  return labels[category] ?? category;
}

function primaryReasonLabel(returnRecord: Return): string {
  const first = returnRecord.lines[0];
  return first ? reasonCategoryLabel(first.reasonCategory) : "—";
}

export function evaluateReturnWindowFromIso(isoDate?: string, now = new Date()): ReturnWindowEvaluation {
  if (!isoDate) return "unknown";
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return "unknown";
  const diffDays = Math.floor((now.getTime() - parsed.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 15 ? "expired" : "ok";
}

export function buildReturnHeaderMeta(returnRecord: Return, customer: Customer | null): string {
  const datePart = dateLabel(returnRecord.createdAt);
  return `${returnRecord.returnNo} · ${customer?.name ?? "—"} · ${datePart}`;
}

export function buildReturnReferenceKpis(returnRecord: Return): ReturnReferenceKpi[] {
  const impact = calculateReturnImpact(returnRecord);
  const lineCount = returnRecord.lines.length;
  const totalQty = returnRecord.lines.reduce((sum, line) => sum + line.quantity, 0);

  return [
    {
      id: "amount",
      label: "İade tutarı",
      value: impact.balanceImpact > 0 ? `${impact.balanceImpact.toLocaleString("tr-TR")} TRY` : "—",
      hint: impact.balanceImpact > 0 ? undefined : "Finans netleşmesi bekleniyor"
    },
    {
      id: "status",
      label: "Durum",
      value: getReturnStatusLabel(returnRecord.status),
      tone: returnRecord.status === "completed" ? "success" : returnRecord.status === "cancelled" ? "warning" : "default"
    },
    {
      id: "lines",
      label: "Satır sayısı",
      value: lineCount > 0 ? String(lineCount) : "—",
      hint: lineCount > 0 ? `${totalQty} adet` : undefined
    },
    {
      id: "stock",
      label: "Stok etkisi",
      value: impact.stockImpact > 0 ? `${impact.stockImpact} adet geri giriş` : "—"
    },
    {
      id: "finance",
      label: "Finans etkisi",
      value: impact.balanceImpact > 0 ? "Bakiye etkisi var" : "Netleşecek",
      tone: impact.approvalRequired ? "warning" : "default"
    },
    {
      id: "reason",
      label: "İade nedeni",
      value: primaryReasonLabel(returnRecord)
    }
  ];
}

export function buildReturnInfoFields(returnRecord: Return, customer: Customer | null) {
  const impact = calculateReturnImpact(returnRecord);
  return [
    { label: "İade no", value: returnRecord.returnNo },
    { label: "Sipariş no", value: returnRecord.orderNo ?? "—" },
    { label: "Teslim no", value: returnRecord.deliveryNo ?? "—" },
    { label: "Cari", value: customer?.name ?? "—" },
    { label: "Talep tarihi", value: dateLabel(returnRecord.createdAt) },
    { label: "Durum", value: getReturnStatusLabel(returnRecord.status) },
    { label: "Stok etkisi", value: impact.stockImpact > 0 ? `${impact.stockImpact} adet` : "—" },
    { label: "Finans etkisi", value: impact.balanceImpact > 0 ? String(impact.balanceImpact) : "Netleşecek" },
    { label: "İade nedeni", value: primaryReasonLabel(returnRecord) },
    { label: "Açıklama", value: returnRecord.note?.trim() || "—", full: true as const }
  ];
}

export function buildQuickReturnContinueHref(orderId?: string, customerId?: string): string {
  const params = new URLSearchParams({ tab: "return" });
  if (orderId) {
    params.set("order", orderId);
  }
  if (customerId) {
    params.set("customer", customerId);
  }
  return `/hizli-islem/satis-masasi?${params.toString()}`;
}

export { reasonCategoryLabel };
