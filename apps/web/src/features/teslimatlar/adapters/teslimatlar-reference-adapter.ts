// @ts-nocheck
import type { Customer, Delivery, DeliveryStatus } from "@hallederiz/types";
import { getDeliveries } from "../../deliveries/queries/get-deliveries";
import { buildTableMeta, formatTrDate } from "../../../lib/reference/formatters";
import {
  getTsmContext,
  TSM_FILTERS,
  TSM_FILTER_SEARCH_PLACEHOLDER,
  TSM_KPIS,
  TSM_PAGE_NUMBERS,
  TSM_SUBTITLE,
  TSM_TABLE_ROWS,
  TSM_TABLE_TOTAL,
  TSM_TITLE,
  type TeslimatContextDetail,
  type TeslimatKpi,
  type TeslimatStatus,
  type TeslimatTableRow
} from "../data/teslimatlar-operasyon-mock";

export type TeslimatlarReferenceSnapshot = {
  title: string;
  subtitle: string;
  kpis: TeslimatKpi[];
  filterSearchPlaceholder: string;
  filters: typeof TSM_FILTERS;
  demoBanner: string | null;
  tableRows: TeslimatTableRow[];
  tableTotal: string;
  pageNumbers: readonly string[];
  getContext: (rowId: string) => TeslimatContextDetail;
};

const ROUTE_DRIVERS = ["Mehmet Yıldız", "Yusuf Kaya", "Ahmet H.", "Serkan B."] as const;
const ROUTE_PLATES = ["34 ABC 123", "06 DEF 456", "35 GHI 789", "16 JKL 012"] as const;

function mapTeslimatStatus(status: DeliveryStatus): TeslimatStatus {
  switch (status) {
    case "pending":
      return "Planlanan";
    case "ready":
    case "partially_delivered":
      return "Yolda";
    case "delivered":
      return "Tamamlandı";
    case "failed":
    case "rolled_back":
      return "Geciken";
    default:
      return "Planlanan";
  }
}

function documentLabel(delivery: Delivery): string {
  if (delivery.documentStatus === "sent") {
    return `IRS-${delivery.deliveryNo}`;
  }
  if (delivery.documentStatus === "ready") {
    return `IRS-${delivery.deliveryNo} (hazır)`;
  }
  return "Belge eksik";
}

function customerName(delivery: Delivery, customers: Customer[]): string {
  return customers.find((c) => c.id === delivery.customerId)?.name ?? "—";
}

function lineTotals(delivery: Delivery) {
  const lines = delivery.lines ?? [];
  const totalQty = lines.reduce((s, l) => s + (l.orderedQuantity ?? 0), 0);
  const deliveredQty = lines.reduce((s, l) => s + (l.deliveredQuantity ?? 0), 0);
  return {
    items: String(lines.length),
    totalQty: String(totalQty),
    delivered: String(deliveredQty),
    remaining: String(Math.max(0, totalQty - deliveredQty)),
    damaged: "0"
  };
}

function mapDeliveryTableRow(delivery: Delivery, customers: Customer[]): TeslimatTableRow {
  return {
    id: delivery.id,
    deliveryNo: delivery.deliveryNo,
    customer: customerName(delivery, customers),
    status: mapTeslimatStatus(delivery.status),
    document: documentLabel(delivery)
  };
}

function buildContext(delivery: Delivery, customers: Customer[], index: number): TeslimatContextDetail {
  const customer = customers.find((c) => c.id === delivery.customerId);
  const totals = lineTotals(delivery);
  const planned = delivery.plannedAt ? new Date(delivery.plannedAt) : null;
  const plannedTime =
    planned && !Number.isNaN(planned.getTime())
      ? planned.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
      : "—";

  return {
    rowId: delivery.id,
    deliveryNo: delivery.deliveryNo,
    customer: customer?.name ?? "—",
    status: mapTeslimatStatus(delivery.status),
    deliveryDate: formatTrDate(delivery.deliveredAt ?? delivery.plannedAt),
    plannedTime,
    location: [customer?.city, customer?.district].filter(Boolean).join(" / ") || "—",
    driver: ROUTE_DRIVERS[index % ROUTE_DRIVERS.length]!,
    plate: ROUTE_PLATES[index % ROUTE_PLATES.length]!,
    documentId: documentLabel(delivery),
    signatureWarning:
      delivery.documentStatus === "missing"
        ? `${delivery.deliveryNo} belgesi için imza bekleniyor.`
        : "İmza kaydı tamam.",
    maintenanceWarning: delivery.validation?.riskNote || "Araç bakım kontrolü planlandı.",
    totalItems: totals.items,
    totalQuantity: totals.totalQty,
    delivered: totals.delivered,
    remaining: totals.remaining,
    damaged: totals.damaged,
    note: delivery.note || delivery.confirmation?.note || "—"
  };
}

function buildLiveSnapshot(deliveries: Delivery[], customers: Customer[]): TeslimatlarReferenceSnapshot {
  const tableRows = deliveries.map((d) => mapDeliveryTableRow(d, customers));
  const meta = buildTableMeta(deliveries.length);
  const contextByRow = Object.fromEntries(
    deliveries.map((d, i) => [d.id, buildContext(d, customers, i)])
  ) as Record<string, TeslimatContextDetail>;

  const countBy = (status: TeslimatStatus) => tableRows.filter((r) => r.status === status).length;

  return {
    title: TSM_TITLE,
    subtitle: TSM_SUBTITLE,
    kpis: [
      { id: "total", label: "Toplam Teslimat", value: String(deliveries.length), tone: "green" },
      { id: "planned", label: "Planlanan", value: String(countBy("Planlanan")), tone: "gold" },
      { id: "completed", label: "Tamamlanan", value: String(countBy("Tamamlandı")), tone: "teal" },
      { id: "onway", label: "Yolda", value: String(countBy("Yolda")), tone: "blue" },
      { id: "delayed", label: "Geciken", value: String(countBy("Geciken")), tone: "orange" }
    ],
    filterSearchPlaceholder: TSM_FILTER_SEARCH_PLACEHOLDER,
    filters: TSM_FILTERS,
    demoBanner: null,
    tableRows,
    tableTotal: meta.tableTotal,
    pageNumbers: meta.pageNumbers,
    getContext: (rowId) =>
      contextByRow[rowId] ?? buildContext(deliveries[0]!, customers, 0)
  };
}

export function loadTeslimatlarReferenceDemo(): TeslimatlarReferenceSnapshot {
  return {
    title: TSM_TITLE,
    subtitle: TSM_SUBTITLE,
    kpis: TSM_KPIS,
    filterSearchPlaceholder: TSM_FILTER_SEARCH_PLACEHOLDER,
    filters: TSM_FILTERS,
    demoBanner: null,
    tableRows: TSM_TABLE_ROWS,
    tableTotal: TSM_TABLE_TOTAL,
    pageNumbers: TSM_PAGE_NUMBERS,
    getContext: getTsmContext
  };
}

export async function loadTeslimatlarReferenceLive(): Promise<TeslimatlarReferenceSnapshot> {
  const { deliveries, customers } = await getDeliveries();
  return buildLiveSnapshot(deliveries, customers);
}

export const TESLIMATLAR_REFERENCE_INITIAL = loadTeslimatlarReferenceDemo();
