import type { Customer, Delivery } from "@hallederiz/types";
import { getDeliveryStatusLabel } from "../queries/delivery-mock-data";
import { dateLabel } from "./index";

export type DeliveryRouteStop = {
  sequence: number;
  delivery: Delivery;
  customerName: string;
  addressSummary: string;
  addressMissing: boolean;
  statusLabel: string;
  riskLabel: string;
  isRisky: boolean;
  isCompleted: boolean;
  lineCount: number;
  plannedLabel: string;
};

export type DeliveryRouteKpi = {
  id: string;
  label: string;
  value: string;
  tone?: "default" | "success" | "warning";
};

function formatCustomerAddress(customer: Customer | null): { summary: string; missing: boolean } {
  if (!customer) {
    return { summary: "Adres bilgisi eksik", missing: true };
  }
  const parts = [customer.addressLine?.trim(), customer.district?.trim(), customer.city?.trim()].filter(Boolean);
  if (parts.length === 0) {
    return { summary: "Adres bilgisi eksik", missing: true };
  }
  return { summary: parts.join(" · "), missing: false };
}

function resolveRiskLabel(delivery: Delivery): { label: string; risky: boolean } {
  if (delivery.status === "failed" || delivery.status === "rolled_back") {
    return { label: "Geciken / riskli", risky: true };
  }
  if (delivery.validation.paymentMissing) {
    return { label: "Eksik ödeme", risky: true };
  }
  if (delivery.validation.approvalRequired && delivery.status !== "delivered") {
    return { label: "Onay bekliyor", risky: true };
  }
  if (delivery.status === "pending") {
    return { label: "Bekliyor", risky: false };
  }
  return { label: "Normal", risky: false };
}

export function buildDeliveryRouteStops(
  deliveries: Delivery[],
  customers: Customer[]
): DeliveryRouteStop[] {
  const customerMap = new Map(customers.map((customer) => [customer.id, customer]));

  return deliveries.map((delivery, index) => {
    const customer = customerMap.get(delivery.customerId) ?? null;
    const address = formatCustomerAddress(customer);
    const risk = resolveRiskLabel(delivery);

    return {
      sequence: index + 1,
      delivery,
      customerName: customer?.name ?? "—",
      addressSummary: address.summary,
      addressMissing: address.missing,
      statusLabel: getDeliveryStatusLabel(delivery.status),
      riskLabel: risk.label,
      isRisky: risk.risky,
      isCompleted: delivery.status === "delivered",
      lineCount: delivery.lines.length,
      plannedLabel: dateLabel(delivery.deliveredAt ?? delivery.plannedAt)
    };
  });
}

export function buildDeliveryRouteKpis(stops: DeliveryRouteStop[]): DeliveryRouteKpi[] {
  const total = stops.length;
  const completed = stops.filter((stop) => stop.isCompleted).length;
  const risky = stops.filter((stop) => stop.isRisky && !stop.isCompleted).length;
  const pending = stops.filter((stop) => !stop.isCompleted).length;
  const addressMissing = stops.filter((stop) => stop.addressMissing).length;

  return [
    { id: "today", label: "Bugünkü teslimat", value: total > 0 ? String(total) : "—" },
    { id: "stops", label: "Planlanan durak", value: pending > 0 ? String(pending) : total > 0 ? "0" : "—" },
    {
      id: "done",
      label: "Tamamlanan",
      value: completed > 0 ? String(completed) : "—",
      tone: completed > 0 ? "success" : "default"
    },
    {
      id: "risk",
      label: "Geciken / riskli",
      value: risky > 0 ? String(risky) : "—",
      tone: risky > 0 ? "warning" : "default"
    },
    { id: "vehicle", label: "Araç / sürücü", value: "—" },
    { id: "distance", label: "Rota süresi / mesafe", value: "—" }
  ];
}

export function buildDeliveryRouteSummary(stops: DeliveryRouteStop[]) {
  const completed = stops.filter((stop) => stop.isCompleted).length;
  const pending = stops.filter((stop) => !stop.isCompleted).length;
  const risky = stops.filter((stop) => stop.isRisky && !stop.isCompleted).length;
  const addressMissing = stops.filter((stop) => stop.addressMissing).length;
  const ready = stops.length > 0 && risky === 0;

  return {
    totalStops: stops.length,
    completed,
    pending,
    risky,
    addressMissing,
    ready,
    readyLabel: ready ? "Rota taslak hazır" : stops.length === 0 ? "—" : "Kontrol gerekli"
  };
}
