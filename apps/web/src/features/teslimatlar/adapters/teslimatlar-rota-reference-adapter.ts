// @ts-nocheck
import type { Customer, Delivery, DeliveryStatus } from "@hallederiz/types";
import { getDeliveries } from "../../deliveries/queries/get-deliveries";
import { buildTableMeta } from "../../../lib/reference/formatters";
import {
  TSRM_CONTEXT,
  TSRM_DRIVERS,
  TSRM_KPIS,
  TSRM_PAGE_NUMBERS,
  TSRM_STOPS,
  TSRM_SUBTITLE,
  TSRM_TABLE_ROWS,
  TSRM_TABLE_TOTAL,
  TSRM_TITLE,
  type TsrmRouteStatus
} from "../data/teslimatlar-rota-mock";

export type TeslimatlarRotaTableRow = {
  id: string;
  routeNo: string;
  driver: string;
  status: TsrmRouteStatus;
  stops: string;
  distance: string;
  eta: string;
  window: string;
};

export type TeslimatlarRotaContext = {
  routeNo: string;
  status: TsrmRouteStatus;
  driver: string;
  plate: string;
  start: string;
  end: string;
  stops: string;
  distance: string;
  eta: string;
};

export type TeslimatlarRotaStop = {
  id: string;
  name: string;
  address: string;
  time: string;
  state: "done" | "current" | "pending";
};

export type TeslimatlarRotaReferenceSnapshot = {
  title: string;
  subtitle: string;
  kpis: { id: string; label: string; value: string }[];
  drivers: { id: string; name: string; plate: string; status: string; stops: string }[];
  tableRows: TeslimatlarRotaTableRow[];
  tableTotal: string;
  pageNumbers: readonly string[];
  getContext: (rowId: string) => TeslimatlarRotaContext;
  getStops: (rowId: string) => TeslimatlarRotaStop[];
};

const ROUTE_DRIVERS = ["Yusuf Kaya", "Mehmet K.", "Ahmet H.", "Serkan B."] as const;
const ROUTE_PLATES = ["34 ABC 123", "06 DEF 456", "35 GHI 789", "16 JKL 012"] as const;

function mapRouteStatus(status: DeliveryStatus): TsrmRouteStatus {
  switch (status) {
    case "pending":
      return "Planlandı";
    case "ready":
    case "partially_delivered":
      return "Yolda";
    default:
      return "Beklemede";
  }
}

function driverStatusLabel(status: DeliveryStatus): string {
  if (status === "ready" || status === "partially_delivered") return "Yolda";
  if (status === "pending") return "Planlandı";
  if (status === "delivered") return "Tamamlandı";
  return "Beklemede";
}

function plannedWindow(delivery: Delivery): string {
  const d = delivery.plannedAt ? new Date(delivery.plannedAt) : null;
  if (!d || Number.isNaN(d.getTime())) return "—";
  const start = d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  const end = new Date(d.getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit"
  });
  return `${start} – ${end}`;
}

function mapTableRow(delivery: Delivery, customers: Customer[], index: number): TeslimatlarRotaTableRow {
  const lineCount = Math.max(1, delivery.lines?.length ?? 1);
  return {
    id: delivery.id,
    routeNo: `RT-${delivery.deliveryNo.replace(/^DLV-/, "")}`,
    driver: ROUTE_DRIVERS[index % ROUTE_DRIVERS.length]!,
    status: mapRouteStatus(delivery.status),
    stops: String(lineCount),
    distance: `${(12 + index * 8.2).toFixed(1)} km`,
    eta: `${1 + (index % 2)}s ${20 + index * 15}dk`,
    window: plannedWindow(delivery)
  };
}

function buildContext(row: TeslimatlarRotaTableRow, index: number): TeslimatlarRotaContext {
  const [start, end] = row.window.includes("–") ? row.window.split("–").map((s) => s.trim()) : ["—", "—"];
  return {
    routeNo: row.routeNo,
    status: row.status,
    driver: row.driver,
    plate: ROUTE_PLATES[index % ROUTE_PLATES.length]!,
    start: start ?? "—",
    end: end ?? "—",
    stops: row.stops,
    distance: row.distance,
    eta: row.eta
  };
}

function buildStops(delivery: Delivery, customers: Customer[]): TeslimatlarRotaStop[] {
  const customer = customers.find((c) => c.id === delivery.customerId);
  const baseName = customer?.name ?? delivery.orderNo;
  const address = [customer?.district, customer?.city].filter(Boolean).join(" / ") || "Adres bilgisi yok";
  const lines = delivery.lines?.slice(0, 6) ?? [];

  if (lines.length === 0) {
    return [
      {
        id: `${delivery.id}-1`,
        name: baseName,
        address,
        time: "09:00",
        state: delivery.status === "delivered" ? "done" : "current"
      }
    ];
  }

  return lines.map((line, i) => ({
    id: `${delivery.id}-${line.id}`,
    name: line.productName,
    address,
    time: `${8 + i}:${(i * 15) % 60}`.replace(/^(\d):/, "0$1:"),
    state:
      delivery.status === "delivered"
        ? "done"
        : i === 0
          ? "current"
          : "pending"
  }));
}

function buildLiveSnapshot(deliveries: Delivery[], customers: Customer[]): TeslimatlarRotaReferenceSnapshot {
  const tableRows = deliveries.map((d, i) => mapTableRow(d, customers, i));
  const meta = buildTableMeta(deliveries.length);
  const contextByRow = Object.fromEntries(
    tableRows.map((row, i) => [row.id, buildContext(row, i)])
  ) as Record<string, TeslimatlarRotaContext>;
  const stopsByRow = Object.fromEntries(
    deliveries.map((d) => [d.id, buildStops(d, customers)])
  ) as Record<string, TeslimatlarRotaStop[]>;

  const onWay = tableRows.filter((r) => r.status === "Yolda").length;
  const planned = tableRows.filter((r) => r.status === "Planlandı").length;
  const done = deliveries.filter((d) => d.status === "delivered").length;

  const drivers = deliveries.slice(0, 4).map((d, i) => ({
    id: String(i + 1),
    name: ROUTE_DRIVERS[i % ROUTE_DRIVERS.length]!,
    plate: ROUTE_PLATES[i % ROUTE_PLATES.length]!,
    status: driverStatusLabel(d.status),
    stops: `${Math.max(1, d.lines?.length ?? 1)} Durak`
  }));

  return {
    title: TSRM_TITLE,
    subtitle: TSRM_SUBTITLE,
    kpis: [
      { id: "routes", label: "Toplam Rota", value: String(deliveries.length) },
      { id: "planned", label: "Planlanan Teslimat", value: String(planned) },
      {
        id: "done",
        label: "Tamamlanan",
        value: deliveries.length ? `${done} (%${Math.round((done / deliveries.length) * 100)})` : "0"
      },
      { id: "onway", label: "Yolda", value: String(onWay) },
      { id: "waiting", label: "Bekleyen", value: String(tableRows.filter((r) => r.status === "Beklemede").length) },
      { id: "distance", label: "Toplam Mesafe", value: `${(deliveries.length * 42.3).toFixed(1)} km` },
      { id: "eta", label: "Tahmini Süre", value: `${deliveries.length}s ${deliveries.length * 12}dk` }
    ],
    drivers: drivers.length ? drivers : [...TSRM_DRIVERS],
    tableRows,
    tableTotal: meta.tableTotal,
    pageNumbers: meta.pageNumbers,
    getContext: (rowId) => contextByRow[rowId] ?? buildContext(tableRows[0]!, 0),
    getStops: (rowId) => stopsByRow[rowId] ?? buildStops(deliveries[0]!, customers)
  };
}

export function loadTeslimatlarRotaReferenceDemo(): TeslimatlarRotaReferenceSnapshot {
  const tableRows = TSRM_TABLE_ROWS.map((r) => ({ ...r }));
  return {
    title: TSRM_TITLE,
    subtitle: TSRM_SUBTITLE,
    kpis: [...TSRM_KPIS],
    drivers: [...TSRM_DRIVERS],
    tableRows,
    tableTotal: TSRM_TABLE_TOTAL,
    pageNumbers: TSRM_PAGE_NUMBERS,
    getContext: () => ({ ...TSRM_CONTEXT }),
    getStops: () => [...TSRM_STOPS]
  };
}

export async function loadTeslimatlarRotaReferenceLive(): Promise<TeslimatlarRotaReferenceSnapshot> {
  const { deliveries, customers } = await getDeliveries();
  return buildLiveSnapshot(deliveries, customers);
}

export const TESLIMATLAR_ROTA_REFERENCE_INITIAL = loadTeslimatlarRotaReferenceDemo();
