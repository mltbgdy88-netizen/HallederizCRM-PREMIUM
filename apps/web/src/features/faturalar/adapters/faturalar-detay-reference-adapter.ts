// @ts-nocheck
import type { Customer, Invoice } from "@hallederiz/types";
import { REFERENCE_DEMO_BANNER } from "../../../lib/reference/constants";
import { REFERENCE_ROUTE_IDS } from "../../../lib/reference/reference-route-ids";
import { formatTrDate, formatTrDateTime, formatTryMoney } from "../../../lib/reference/formatters";
import { getInvoiceStatusLabel } from "../../invoices/queries/invoice-mock-data";
import { getInvoiceDetail } from "../../invoices/queries/get-invoices";
import {
  FDM_CONTEXT,
  FDM_CUSTOMER,
  FDM_DESCRIPTION,
  FDM_HERO,
  FDM_NOTES,
  FDM_PAGE,
  FDM_PAYMENT,
  FDM_TABS,
  FDM_TOTALS,
  type FdmTab
} from "../data/faturalar-detay-mock";

export type FaturalarDetayReferenceSnapshot = {
  invoiceId: string;
  demoBanner: string | null;
  page: typeof FDM_PAGE;
  hero: typeof FDM_HERO;
  tabs: readonly FdmTab[];
  customer: typeof FDM_CUSTOMER;
  description: typeof FDM_DESCRIPTION;
  notes: typeof FDM_NOTES;
  totals: typeof FDM_TOTALS;
  payment: typeof FDM_PAYMENT;
  context: typeof FDM_CONTEXT;
};

function mapPaymentLabel(status: string): string {
  if (status === "paid") return "Ödendi";
  if (status === "partial") return "Kısmi Ödeme";
  return "Bekliyor";
}

function buildSnapshot(invoice: Invoice, customers: Customer[], demoBanner: string | null): FaturalarDetayReferenceSnapshot {
  const customer = customers.find((c) => c.id === invoice.customerId);
  const paymentLabel = mapPaymentLabel(invoice.paymentStatus);
  const issueDate = invoice.issueDate ?? invoice.updatedAt ?? invoice.createdAt;
  const dueDate = issueDate;
  const subtotal = invoice.subtotal ?? 0;
  const tax = invoice.taxTotal ?? 0;
  const grand = invoice.grandTotal ?? subtotal + tax;

  return {
    invoiceId: invoice.id,
    demoBanner,
    page: {
      ...FDM_PAGE,
      title: "Fatura Detay"
    },
    hero: {
      ...FDM_HERO,
      invoiceId: invoice.invoiceNo,
      invoiceDate: formatTrDateTime(issueDate),
      dueDate: formatTrDate(dueDate),
      dueNote: paymentLabel === "Ödendi" ? "Tamamlandı" : "Takipte",
      currency: `${invoice.currency} Türk Lirası`,
      status: paymentLabel,
      statusNote: getInvoiceStatusLabel(invoice.status),
      creator: customer?.name ?? FDM_HERO.creator,
      creatorRole: "Cari"
    },
    tabs: [...FDM_TABS],
    customer: {
      ...FDM_CUSTOMER,
      fields: [
        { label: "Müşteri", value: customer?.name ?? "—" },
        { label: "Cari Kodu", value: customer?.code ?? "—" },
        { label: "Vergi Dairesi", value: "—" },
        { label: "Vergi Numarası", value: customer?.taxNumber ?? "—" },
        { label: "E-Posta", value: customer?.email ?? "—" },
        { label: "Telefon", value: customer?.phone ?? "—" }
      ]
    },
    description: {
      ...FDM_DESCRIPTION,
      text: invoice.note ?? FDM_DESCRIPTION.text
    },
    notes: { ...FDM_NOTES, text: invoice.note ?? FDM_NOTES.text },
    totals: {
      ...FDM_TOTALS,
      rows: [
        { label: "Mal Hizmet Toplam Tutarı", value: formatTryMoney(subtotal, invoice.currency) },
        { label: "İskonto Tutarı", value: formatTryMoney(0, invoice.currency) },
        { label: "Ara Toplam", value: formatTryMoney(subtotal, invoice.currency) },
        { label: "KDV", value: formatTryMoney(tax, invoice.currency) },
        { label: "Diğer Vergiler", value: formatTryMoney(0, invoice.currency) }
      ],
      grandTotal: formatTryMoney(grand, invoice.currency)
    },
    payment: {
      ...FDM_PAYMENT,
      fields: [
        { label: "Ödeme Durumu", value: paymentLabel, tone: paymentLabel === "Ödendi" ? "success" : undefined },
        { label: "Ödenen Tutar", value: formatTryMoney(invoice.paidTotal ?? 0, invoice.currency) },
        { label: "Ödeme Yöntemi", value: "Havale / EFT" },
        { label: "Ödeme Tarihi", value: formatTrDate(issueDate) },
        { label: "İşlem Referansı", value: invoice.id }
      ]
    },
    context: {
      ...FDM_CONTEXT,
      rows: [
        { label: "Fatura No", value: invoice.invoiceNo },
        { label: "Fatura Tarihi", value: formatTrDate(issueDate) },
        { label: "Vade Tarihi", value: formatTrDate(dueDate) },
        { label: "Belge No", value: invoice.documentId ?? "—" },
        { label: "Senaryo", value: "TICARIFATURA" },
        { label: "Fatura Tipi", value: "SATIŞ" },
        { label: "Oluşturan", value: customer?.name ?? "—" },
        { label: "Oluşturma Zamanı", value: formatTrDateTime(invoice.createdAt) },
        { label: "Son Güncelleme", value: formatTrDateTime(invoice.updatedAt) }
      ]
    }
  };
}

export function loadFaturalarDetayReferenceDemo(): FaturalarDetayReferenceSnapshot {
  return {
    invoiceId: REFERENCE_ROUTE_IDS.invoiceId,
    demoBanner: REFERENCE_DEMO_BANNER,
    page: { ...FDM_PAGE },
    hero: { ...FDM_HERO },
    tabs: [...FDM_TABS],
    customer: { ...FDM_CUSTOMER, fields: FDM_CUSTOMER.fields.map((f) => ({ ...f })) },
    description: { ...FDM_DESCRIPTION },
    notes: { ...FDM_NOTES },
    totals: { ...FDM_TOTALS, rows: FDM_TOTALS.rows.map((r) => ({ ...r })) },
    payment: { ...FDM_PAYMENT, fields: FDM_PAYMENT.fields.map((f) => ({ ...f })) },
    context: { ...FDM_CONTEXT, rows: FDM_CONTEXT.rows.map((r) => ({ ...r })), actions: FDM_CONTEXT.actions.map((a) => ({ ...a })) }
  };
}

export async function loadFaturalarDetayReferenceLive(invoiceId?: string): Promise<FaturalarDetayReferenceSnapshot> {
  const resolved = (invoiceId ?? REFERENCE_ROUTE_IDS.invoiceId).trim() || REFERENCE_ROUTE_IDS.invoiceId;
  const { invoice, invoices, customers } = await getInvoiceDetail(resolved);
  const selected = invoice ?? invoices[0];
  if (!selected) return loadFaturalarDetayReferenceDemo();
  return buildSnapshot(selected, customers, null);
}

export const FATURALAR_DETAY_REFERENCE_INITIAL = loadFaturalarDetayReferenceDemo();

