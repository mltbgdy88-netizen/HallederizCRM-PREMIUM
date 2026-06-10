// @ts-nocheck
import type { Customer, Invoice, InvoicePaymentStatus, InvoiceStatus } from "@hallederiz/types";
import { getInvoices } from "../../invoices/queries/get-invoices";
import { getInvoiceStatusLabel } from "../../invoices/queries/invoice-mock-data";
import { buildTableMeta, formatTrDateTime, formatTryMoney } from "../../../lib/reference/formatters";
import {
  getFatContext,
  FAT_FILTERS,
  FAT_FILTER_SEARCH_PLACEHOLDER,
  FAT_KPIS,
  FAT_PAGE_NUMBERS,
  FAT_SUBTITLE,
  FAT_TABLE_ROWS,
  FAT_TABLE_TOTAL,
  FAT_TITLE,
  type FaturalarContextDetail,
  type FaturalarKpi,
  type FaturalarPayment,
  type FaturalarStatus,
  type FaturalarTableRow
} from "../data/faturalar-operasyon-mock";

export type FaturalarReferenceSnapshot = {
  title: string;
  subtitle: string;
  kpis: FaturalarKpi[];
  filterSearchPlaceholder: string;
  filters: typeof FAT_FILTERS;
  demoBanner: string | null;
  tableRows: FaturalarTableRow[];
  tableTotal: string;
  pageNumbers: readonly string[];
  getContext: (rowId: string) => FaturalarContextDetail;
};

function mapInvoiceStatus(status: InvoiceStatus): FaturalarStatus {
  const label = getInvoiceStatusLabel(status);
  if (label === "Taslak") return "Taslak";
  if (label === "Iptal" || label === "İptal") return "İptal";
  return "Kesildi";
}

function mapPaymentStatus(status: InvoicePaymentStatus): FaturalarPayment {
  switch (status) {
    case "paid":
      return "Ödendi";
    case "partial":
      return "Kısmi Ödeme";
    default:
      return "Bekliyor";
  }
}

function mapInvoiceTableRow(invoice: Invoice, customers: Customer[]): FaturalarTableRow {
  const customer = customers.find((c) => c.id === invoice.customerId);
  return {
    id: invoice.id,
    invoiceNo: invoice.invoiceNo,
    invoiceMeta: formatTrDateTime(invoice.issueDate ?? invoice.updatedAt),
    customer: customer?.name ?? "—",
    amount: formatTryMoney(invoice.grandTotal, invoice.currency),
    status: mapInvoiceStatus(invoice.status),
    payment: mapPaymentStatus(invoice.paymentStatus)
  };
}

function buildContext(invoice: Invoice, customers: Customer[]): FaturalarContextDetail {
  const customer = customers.find((c) => c.id === invoice.customerId);
  return {
    invoiceNo: invoice.invoiceNo,
    status: mapInvoiceStatus(invoice.status),
    createdAt: formatTrDateTime(invoice.issueDate ?? invoice.createdAt),
    customer: customer?.name ?? "—",
    accountCode: customer?.code ?? "—",
    amount: formatTryMoney(invoice.grandTotal, invoice.currency),
    currency: invoice.currency,
    dueDate: formatTrDateTime(invoice.issueDate ?? invoice.updatedAt),
    payment: mapPaymentStatus(invoice.paymentStatus),
    docActions: ["Görüntüle", "Düzenle", "PDF İndir", "Yazdır", "E-posta Gönder", "İptal Et"],
    paymentActions: ["Ödeme Kaydı Oluştur", "Tahsilat Ekle", "Ödeme Geçmişi"]
  };
}

function buildLiveSnapshot(invoices: Invoice[], customers: Customer[]): FaturalarReferenceSnapshot {
  const tableRows = invoices.map((inv) => mapInvoiceTableRow(inv, customers));
  const meta = buildTableMeta(invoices.length);
  const contextByRow = Object.fromEntries(
    invoices.map((inv) => [inv.id, buildContext(inv, customers)])
  ) as Record<string, FaturalarContextDetail>;

  return {
    title: FAT_TITLE,
    subtitle: FAT_SUBTITLE,
    kpis: [
      { id: "total", label: "Toplam Fatura", value: String(invoices.length), tone: "blue" },
      { id: "draft", label: "Taslak Fatura", value: String(tableRows.filter((r) => r.status === "Taslak").length), tone: "orange" },
      { id: "pending", label: "Bekleyen Ödeme", value: String(tableRows.filter((r) => r.payment === "Bekliyor").length), tone: "teal" },
      { id: "paid", label: "Ödenmiş Fatura", value: String(tableRows.filter((r) => r.payment === "Ödendi").length), tone: "green" },
      { id: "overdue", label: "Vadesi Geçmiş", value: "—", tone: "gold" }
    ],
    filterSearchPlaceholder: FAT_FILTER_SEARCH_PLACEHOLDER,
    filters: FAT_FILTERS,
    demoBanner: null,
    tableRows,
    tableTotal: meta.tableTotal,
    pageNumbers: meta.pageNumbers,
    getContext: (rowId) => contextByRow[rowId] ?? buildContext(invoices[0]!, customers)
  };
}

export function loadFaturalarReferenceDemo(): FaturalarReferenceSnapshot {
  return {
    title: FAT_TITLE,
    subtitle: FAT_SUBTITLE,
    kpis: FAT_KPIS,
    filterSearchPlaceholder: FAT_FILTER_SEARCH_PLACEHOLDER,
    filters: FAT_FILTERS,
    demoBanner: null,
    tableRows: FAT_TABLE_ROWS,
    tableTotal: FAT_TABLE_TOTAL,
    pageNumbers: FAT_PAGE_NUMBERS,
    getContext: getFatContext
  };
}

export async function loadFaturalarReferenceLive(): Promise<FaturalarReferenceSnapshot> {
  const { invoices, customers } = await getInvoices();
  return buildLiveSnapshot(invoices, customers);
}

export const FATURALAR_REFERENCE_INITIAL = loadFaturalarReferenceDemo();

