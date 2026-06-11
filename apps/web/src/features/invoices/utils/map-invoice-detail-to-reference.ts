import type { Customer, Invoice, InvoiceDeliveryStatus, InvoicePaymentStatus } from "@hallederiz/types";
import { getInvoiceStatusLabel } from "../queries/invoice-mock-data";
import { dateLabel, money } from "./index";

export type InvoiceReferenceKpi = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "success" | "warning";
};

function paymentStatusLabel(status: InvoicePaymentStatus): string {
  const labels: Record<InvoicePaymentStatus, string> = {
    unpaid: "Ödenmedi",
    partial: "Kısmi ödendi",
    paid: "Ödendi"
  };
  return labels[status] ?? status;
}

function deliveryStatusLabel(status: InvoiceDeliveryStatus): string {
  const labels: Record<InvoiceDeliveryStatus, string> = {
    not_sent: "Gönderilmedi",
    queued: "Kuyrukta",
    sent: "Gönderildi",
    delivered: "Teslim edildi",
    failed: "Başarısız"
  };
  return labels[status] ?? status;
}

function documentStatusLabel(invoice: Invoice): string {
  if (invoice.documentId) {
    return "Belge mevcut";
  }
  return deliveryStatusLabel(invoice.deliveryStatus);
}

export function buildInvoiceHeaderMeta(invoice: Invoice, customer: Customer | null): string {
  const datePart = invoice.issueDate ? dateLabel(invoice.issueDate) : "—";
  return `${invoice.invoiceNo} · ${customer?.name ?? "—"} · ${datePart}`;
}

export function buildInvoiceReferenceKpis(invoice: Invoice): InvoiceReferenceKpi[] {
  const lineCount = invoice.lines.length;

  return [
    {
      id: "total",
      label: "Fatura tutarı",
      value: money(invoice.grandTotal, invoice.currency),
      tone: invoice.status === "issued" ? "success" : "default"
    },
    {
      id: "status",
      label: "Durum",
      value: getInvoiceStatusLabel(invoice.status),
      tone: invoice.status === "cancelled" ? "warning" : invoice.status === "issued" ? "success" : "default"
    },
    {
      id: "payment",
      label: "Tahsilat durumu",
      value: paymentStatusLabel(invoice.paymentStatus),
      tone: invoice.paymentStatus === "paid" ? "success" : invoice.paymentStatus === "unpaid" ? "warning" : "default"
    },
    {
      id: "document",
      label: "Belge / PDF",
      value: documentStatusLabel(invoice),
      tone: invoice.documentId ? "success" : "default"
    },
    {
      id: "lines",
      label: "Satır sayısı",
      value: lineCount > 0 ? String(lineCount) : "—"
    }
  ];
}

export function buildInvoiceInfoFields(invoice: Invoice, customer: Customer | null) {
  return [
    { label: "Fatura no", value: invoice.invoiceNo },
    { label: "Sipariş no", value: invoice.orderNo ?? "—" },
    { label: "Cari", value: customer?.name ?? "—" },
    { label: "Kesim tarihi", value: invoice.issueDate ? dateLabel(invoice.issueDate) : "—" },
    { label: "Durum", value: getInvoiceStatusLabel(invoice.status) },
    { label: "Tahsilat", value: paymentStatusLabel(invoice.paymentStatus) },
    { label: "Gönderim", value: deliveryStatusLabel(invoice.deliveryStatus) },
    { label: "Para birimi", value: invoice.currency ?? "—" },
    { label: "Belge kaydı", value: invoice.documentId ?? "—", full: true as const }
  ];
}

export { paymentStatusLabel, deliveryStatusLabel, documentStatusLabel };
