import type { Customer, SaleOrder } from "@hallederiz/types";
import { fulfillmentFromSaleOrder } from "../../../lib/siparis-fulfillment-links";
import { mapOrderRow } from "../../orders/mappers/map-order-row";
import { getOrders } from "../../orders/queries/get-orders";
import { buildTableMeta, formatTrDate, formatTryMoney } from "../../../lib/reference/formatters";
import {
  getSipContext,
  SIP_FILTERS,
  SIP_FILTER_SEARCH_PLACEHOLDER,
  SIP_KPIS,
  SIP_PAGE_NUMBERS,
  SIP_SUBTITLE,
  SIP_TABLE_ROWS,
  SIP_TABLE_TOTAL,
  SIP_TITLE,
  type SiparisContextDetail,
  type SiparisKpi,
  type SiparisStatus,
  type SiparisTableRow
} from "../data/siparisler-operasyon-mock";

export type SiparislerReferenceSnapshot = {
  title: string;
  subtitle: string;
  kpis: SiparisKpi[];
  filterSearchPlaceholder: string;
  filters: typeof SIP_FILTERS;
  demoBanner: string | null;
  tableRows: SiparisTableRow[];
  tableTotal: string;
  pageNumbers: readonly string[];
  getContext: (rowId: string) => SiparisContextDetail;
};

function mapOrderStatus(label: string): SiparisStatus {
  const map: Record<string, SiparisStatus> = {
    Açık: "Açık",
    "Onay Bekliyor": "Bekleyen Onay",
    Hazırlanıyor: "Teslimat Bekleyen",
    "Kısmi Teslim": "Kısmi Teslim",
    Teslim: "Teslim Edildi",
    "Teslim Edildi": "Teslim Edildi",
    İptal: "İptal Edildi",
    "Ödeme Bekliyor": "Bekleyen Ödeme"
  };
  return map[label] ?? "Açık";
}

function mapOrderTableRow(order: SaleOrder, customers: Customer[]): SiparisTableRow {
  const row = mapOrderRow(order, customers);
  return {
    id: order.id,
    orderNo: row.orderNo,
    customer: row.customerName,
    amount: row.totalLabel.startsWith("₺") ? row.totalLabel : `₺${row.totalLabel}`,
    status: mapOrderStatus(row.statusLabel),
    delivery: row.lastActionLabel || formatTrDate(order.updatedAt)
  };
}

function buildContext(order: SaleOrder, customers: Customer[]): SiparisContextDetail {
  const customer = customers.find((c) => c.id === order.customerId);
  const row = mapOrderRow(order, customers);
  const fulfillment = fulfillmentFromSaleOrder(order);
  return {
    orderId: order.id,
    orderNo: order.orderNo,
    fulfillment,
    status: mapOrderStatus(row.statusLabel),
    customer: row.customerName,
    contact: "—",
    phone: customer?.phone || "—",
    email: customer?.email || "—",
    deliveryDate: formatTrDate(order.updatedAt),
    totalAmount: formatTryMoney(order.grandTotal, order.currency),
    paymentMethod: row.paymentStatusLabel,
    lineCount: `${order.lines?.length ?? 0} kalem`,
    quantity: "—",
    discount: "—",
    subtotal: formatTryMoney(order.subtotal ?? order.grandTotal, order.currency),
    vat: formatTryMoney(order.taxTotal ?? 0, order.currency),
    grandTotal: formatTryMoney(order.grandTotal, order.currency),
    paymentAlert: row.paymentStatusLabel,
    dueCount: "—"
  };
}

function buildLiveSnapshot(orders: SaleOrder[], customers: Customer[]): SiparislerReferenceSnapshot {
  const tableRows = orders.map((order) => mapOrderTableRow(order, customers));
  const meta = buildTableMeta(orders.length);
  const contextByRow = Object.fromEntries(
    orders.map((order) => [order.id, buildContext(order, customers)])
  ) as Record<string, SiparisContextDetail>;

  return {
    title: SIP_TITLE,
    subtitle: SIP_SUBTITLE,
    kpis: [
      { id: "open", label: "Açık Sipariş", value: String(tableRows.filter((r) => r.status === "Açık").length), tone: "green" },
      { id: "approval", label: "Bekleyen Onay", value: String(tableRows.filter((r) => r.status === "Bekleyen Onay").length), tone: "gold" },
      { id: "delivery", label: "Teslimat Bekleyen", value: String(tableRows.filter((r) => r.status === "Teslimat Bekleyen").length), tone: "teal" },
      { id: "revenue", label: "Toplam Ciro", value: formatTryMoney(orders.reduce((s, o) => s + o.grandTotal, 0)), tone: "blue" },
      { id: "risk", label: "Riskli Sipariş", value: "—", tone: "orange" }
    ],
    filterSearchPlaceholder: SIP_FILTER_SEARCH_PLACEHOLDER,
    filters: SIP_FILTERS,
    demoBanner: null,
    tableRows,
    tableTotal: meta.tableTotal,
    pageNumbers: meta.pageNumbers,
    getContext: (rowId) => contextByRow[rowId] ?? buildContext(orders[0]!, customers)
  };
}

export function loadSiparislerReferenceDemo(): SiparislerReferenceSnapshot {
  return {
    title: SIP_TITLE,
    subtitle: SIP_SUBTITLE,
    kpis: SIP_KPIS,
    filterSearchPlaceholder: SIP_FILTER_SEARCH_PLACEHOLDER,
    filters: SIP_FILTERS,
    demoBanner: null,
    tableRows: SIP_TABLE_ROWS,
    tableTotal: SIP_TABLE_TOTAL,
    pageNumbers: SIP_PAGE_NUMBERS,
    getContext: getSipContext
  };
}

export async function loadSiparislerReferenceLive(): Promise<SiparislerReferenceSnapshot> {
  const { orders, customers } = await getOrders();
  return buildLiveSnapshot(orders, customers);
}

export const SIPARISLER_REFERENCE_INITIAL = loadSiparislerReferenceDemo();
