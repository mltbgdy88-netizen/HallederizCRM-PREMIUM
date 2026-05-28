import type { Customer, PaymentReceipt } from "@hallederiz/types";
import { mapPaymentRow } from "../../payments/mappers/map-payment-row";
import { getPayments } from "../../payments/queries/get-payments";
import { buildTableMeta, formatTryMoney } from "../../../lib/reference/formatters";
import {
  getThmContext,
  THM_FILTERS,
  THM_FILTER_SEARCH_PLACEHOLDER,
  THM_KPIS,
  THM_SUBTITLE,
  THM_TABLE_ROWS,
  THM_TITLE,
  type TahsilatContextDetail,
  type TahsilatKpi,
  type TahsilatStatus,
  type TahsilatTableRow
} from "../data/tahsilatlar-operasyon-mock";

export type TahsilatlarReferenceSnapshot = {
  title: string;
  subtitle: string;
  kpis: TahsilatKpi[];
  filterSearchPlaceholder: string;
  filters: typeof THM_FILTERS;
  demoBanner: string | null;
  tableRows: TahsilatTableRow[];
  tableTotal: string;
  pageNumbers: readonly string[];
  getContext: (rowId: string) => TahsilatContextDetail;
};

function mapPaymentStatus(label: string): TahsilatStatus {
  if (label.includes("Tahsil") || label.includes("Tahsis") || label === "Tahsis Edildi") return "Tahsil Edildi";
  if (label.includes("Geç") || label.includes("Vade")) return "Vadesi Geçti";
  return "Beklemede";
}

function mapPaymentTableRow(payment: PaymentReceipt, customers: Customer[]): TahsilatTableRow {
  const row = mapPaymentRow(payment, customers);
  return {
    id: payment.id,
    receiptNo: row.receiptNo,
    customer: row.customerName,
    amount: row.amountLabel,
    status: mapPaymentStatus(row.statusLabel),
    date: row.dateOnlyLabel
  };
}

function buildContext(payment: PaymentReceipt, customers: Customer[]): TahsilatContextDetail {
  const row = mapPaymentRow(payment, customers);
  return {
    rowId: payment.id,
    customerCode: customers.find((c) => c.id === payment.customerId)?.code ?? "—",
    customerName: row.customerName,
    openBalance: row.remainingBalanceLabel,
    collected: row.amountLabel,
    remaining: row.remainingBalanceLabel,
    overdue: "—",
    overdueInvoiceAlert: "Canlı vade detayı API'den yüklenecek.",
    distribution: [{ label: "Tahsilat", value: row.amountLabel }],
    paymentMethod: row.methodLabel,
    collectionType: "Tahsilat",
    description: payment.description || "—"
  };
}

function buildLiveSnapshot(payments: PaymentReceipt[], customers: Customer[]): TahsilatlarReferenceSnapshot {
  const tableRows = payments.map((p) => mapPaymentTableRow(p, customers));
  const meta = buildTableMeta(payments.length);
  const contextByRow = Object.fromEntries(
    payments.map((p) => [p.id, buildContext(p, customers)])
  ) as Record<string, TahsilatContextDetail>;
  const totalAmount = payments.reduce((s, p) => s + p.amount, 0);

  return {
    title: THM_TITLE,
    subtitle: THM_SUBTITLE,
    kpis: [
      { id: "today", label: "Toplam Tahsilat", value: formatTryMoney(totalAmount), tone: "green" },
      { id: "pending", label: "Bekleyen", value: String(tableRows.filter((r) => r.status === "Beklemede").length), tone: "teal" },
      { id: "overdue", label: "Vadesi Geçen", value: String(tableRows.filter((r) => r.status === "Vadesi Geçti").length), tone: "gold" },
      { id: "month", label: "Kayıt Sayısı", value: String(payments.length), tone: "green" },
      { id: "open", label: "Açık Bakiye", value: "—", tone: "blue" }
    ],
    filterSearchPlaceholder: THM_FILTER_SEARCH_PLACEHOLDER,
    filters: THM_FILTERS,
    demoBanner: null,
    tableRows,
    tableTotal: meta.tableTotal,
    pageNumbers: meta.pageNumbers,
    getContext: (rowId) => contextByRow[rowId] ?? buildContext(payments[0]!, customers)
  };
}

export function loadTahsilatlarReferenceDemo(): TahsilatlarReferenceSnapshot {
  const meta = buildTableMeta(THM_TABLE_ROWS.length);
  return {
    title: THM_TITLE,
    subtitle: THM_SUBTITLE,
    kpis: THM_KPIS,
    filterSearchPlaceholder: THM_FILTER_SEARCH_PLACEHOLDER,
    filters: THM_FILTERS,
    demoBanner: null,
    tableRows: THM_TABLE_ROWS,
    tableTotal: meta.tableTotal,
    pageNumbers: meta.pageNumbers,
    getContext: getThmContext
  };
}

export async function loadTahsilatlarReferenceLive(): Promise<TahsilatlarReferenceSnapshot> {
  const { payments, customers } = await getPayments();
  return buildLiveSnapshot(payments, customers);
}

export const TAHSILATLAR_REFERENCE_INITIAL = loadTahsilatlarReferenceDemo();
