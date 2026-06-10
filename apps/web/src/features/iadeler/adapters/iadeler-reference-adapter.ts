// @ts-nocheck
import type { Customer, Return, ReturnStatus } from "@hallederiz/types";
import { getReturns } from "../../returns/queries/get-returns";
import { getReturnStatusLabel } from "../../returns/queries/return-mock-data";
import { buildTableMeta, formatTrDate, formatTrDateTime, formatTryMoney } from "../../../lib/reference/formatters";
import {
  getIadContext,
  IAD_FILTERS,
  IAD_FILTER_SEARCH_PLACEHOLDER,
  IAD_KPIS,
  IAD_PAGE_NUMBERS,
  IAD_SUBTITLE,
  IAD_TABLE_ROWS,
  IAD_TABLE_TOTAL,
  IAD_TITLE,
  type IadelerContextDetail,
  type IadelerKpi,
  type IadelerStatus,
  type IadelerTableRow
} from "../data/iadeler-operasyon-mock";

export type IadelerReferenceSnapshot = {
  title: string;
  subtitle: string;
  kpis: IadelerKpi[];
  filterSearchPlaceholder: string;
  filters: typeof IAD_FILTERS;
  demoBanner: string | null;
  tableRows: IadelerTableRow[];
  tableTotal: string;
  pageNumbers: readonly string[];
  getContext: (rowId: string) => IadelerContextDetail;
};

function mapReturnStatus(status: ReturnStatus): IadelerStatus {
  switch (status) {
    case "approved":
    case "received":
    case "completed":
      return "Onaylandı";
    case "cancelled":
      return "Reddedildi";
    default:
      return "Bekliyor";
  }
}

function estimateReturnAmount(returnRecord: Return): string {
  const qty = (returnRecord.lines ?? []).reduce((s, l) => s + l.quantity, 0);
  return formatTryMoney(qty * 498);
}

function mapReturnTableRow(returnRecord: Return, customers: Customer[]): IadelerTableRow {
  const customer = customers.find((c) => c.id === returnRecord.customerId);
  return {
    id: returnRecord.id,
    returnNo: returnRecord.returnNo,
    returnMeta: formatTrDateTime(returnRecord.updatedAt),
    orderNo: returnRecord.orderNo ?? "—",
    customer: customer?.name ?? "—",
    date: formatTrDate(returnRecord.createdAt),
    amount: estimateReturnAmount(returnRecord),
    status: mapReturnStatus(returnRecord.status)
  };
}

function buildContext(returnRecord: Return, customers: Customer[]): IadelerContextDetail {
  const customer = customers.find((c) => c.id === returnRecord.customerId);
  const lineCount = returnRecord.lines?.length ?? 0;
  const totalQty = (returnRecord.lines ?? []).reduce((s, l) => s + l.quantity, 0);
  const amount = estimateReturnAmount(returnRecord);

  return {
    returnNo: returnRecord.returnNo,
    status: mapReturnStatus(returnRecord.status),
    createdAt: formatTrDateTime(returnRecord.createdAt),
    orderNo: returnRecord.orderNo ?? "—",
    customer: customer?.name ?? "—",
    contact: customer?.name ?? "—",
    amount,
    reason: returnRecord.lines?.[0]?.reasonCategory ?? "—",
    description: returnRecord.note ?? "—",
    financialImpact: amount.startsWith("₺") ? `-${amount.slice(1)}` : `-${amount}`,
    stockImpact: `+${totalQty} adet`,
    netImpact: amount.startsWith("₺") ? `-${amount.slice(1)}` : `-${amount}`,
    productSummary: [
      { label: "Toplam Ürün", value: `${lineCount} kalem` },
      { label: "Toplam Adet", value: String(totalQty) },
      { label: "Durum", value: getReturnStatusLabel(returnRecord.status) },
      { label: "Teslimat", value: returnRecord.deliveryNo ?? "—" },
      { label: "İade Oranı", value: lineCount ? "%100" : "—" }
    ],
    approval: [
      { label: "Talep", value: formatTrDateTime(returnRecord.createdAt) },
      { label: "Son Güncelleme", value: formatTrDateTime(returnRecord.updatedAt) }
    ]
  };
}

function buildLiveSnapshot(returns: Return[], customers: Customer[]): IadelerReferenceSnapshot {
  const tableRows = returns.map((r) => mapReturnTableRow(r, customers));
  const meta = buildTableMeta(returns.length);
  const contextByRow = Object.fromEntries(
    returns.map((r) => [r.id, buildContext(r, customers)])
  ) as Record<string, IadelerContextDetail>;
  const totalAmount = returns.reduce(
    (s, r) => s + (r.lines ?? []).reduce((ls, l) => ls + l.quantity * 498, 0),
    0
  );

  return {
    title: IAD_TITLE,
    subtitle: IAD_SUBTITLE,
    kpis: [
      { id: "total", label: "Toplam İade", value: String(returns.length), tone: "blue" },
      { id: "pending", label: "Bekleyen İade", value: String(tableRows.filter((r) => r.status === "Bekliyor").length), tone: "orange" },
      { id: "approved", label: "Onaylanan İade", value: String(tableRows.filter((r) => r.status === "Onaylandı").length), tone: "green" },
      { id: "rejected", label: "Reddedilen İade", value: String(tableRows.filter((r) => r.status === "Reddedildi").length), tone: "red" },
      { id: "amount", label: "İade Tutarı", value: formatTryMoney(totalAmount), tone: "green" },
      { id: "stock", label: "Stok Etkisi", value: `${(returns.reduce((s, r) => s + (r.lines?.length ?? 0), 0))} kalem`, tone: "orange" }
    ],
    filterSearchPlaceholder: IAD_FILTER_SEARCH_PLACEHOLDER,
    filters: IAD_FILTERS,
    demoBanner: null,
    tableRows,
    tableTotal: meta.tableTotal,
    pageNumbers: meta.pageNumbers,
    getContext: (rowId) => contextByRow[rowId] ?? buildContext(returns[0]!, customers)
  };
}

export function loadIadelerReferenceDemo(): IadelerReferenceSnapshot {
  return {
    title: IAD_TITLE,
    subtitle: IAD_SUBTITLE,
    kpis: IAD_KPIS,
    filterSearchPlaceholder: IAD_FILTER_SEARCH_PLACEHOLDER,
    filters: IAD_FILTERS,
    demoBanner: null,
    tableRows: IAD_TABLE_ROWS,
    tableTotal: IAD_TABLE_TOTAL,
    pageNumbers: IAD_PAGE_NUMBERS,
    getContext: getIadContext
  };
}

export async function loadIadelerReferenceLive(): Promise<IadelerReferenceSnapshot> {
  const { returns, customers } = await getReturns();
  return buildLiveSnapshot(returns, customers);
}

export const IADELER_REFERENCE_INITIAL = loadIadelerReferenceDemo();

