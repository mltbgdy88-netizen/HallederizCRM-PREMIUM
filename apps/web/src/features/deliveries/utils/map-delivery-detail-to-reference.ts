import type { Customer, Delivery } from "@hallederiz/types";
import { getDeliveryStatusLabel } from "../queries/delivery-mock-data";
import { dateLabel } from "./index";

export type DeliveryReferenceKpi = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "success" | "warning";
};

function documentStatusLabel(status: Delivery["documentStatus"]): string {
  const labels: Record<Delivery["documentStatus"], string> = {
    missing: "Eksik",
    ready: "Hazır",
    sent: "Gönderildi"
  };
  return labels[status] ?? status;
}

function notificationStatusLabel(delivery: Delivery): string {
  if (delivery.confirmation?.customerNotified) {
    return "Gönderildi";
  }
  return "Taslak";
}

export function buildDeliveryHeaderMeta(delivery: Delivery, customer: Customer | null): string {
  const datePart = dateLabel(delivery.deliveredAt ?? delivery.plannedAt);
  return `${delivery.deliveryNo} · ${customer?.name ?? "—"} · ${datePart}`;
}

export function buildDeliveryReferenceKpis(delivery: Delivery): DeliveryReferenceKpi[] {
  const lineCount = delivery.lines.length;
  const deliveredTotal = delivery.lines.reduce((sum, line) => sum + (line.deliveredQuantity ?? 0), 0);
  const preparedTotal = delivery.lines.reduce((sum, line) => sum + (line.preparedQuantity ?? 0), 0);

  return [
    {
      id: "qty",
      label: "Teslim edilen",
      value: lineCount > 0 ? `${deliveredTotal} adet` : "—",
      hint: lineCount > 0 ? `${lineCount} satır` : undefined
    },
    {
      id: "status",
      label: "Teslim durumu",
      value: getDeliveryStatusLabel(delivery.status),
      tone: delivery.status === "delivered" ? "success" : delivery.status === "pending" ? "warning" : "default"
    },
    {
      id: "method",
      label: "Teslim yöntemi",
      value: "—"
    },
    {
      id: "document",
      label: "Belge durumu",
      value: documentStatusLabel(delivery.documentStatus),
      tone: delivery.documentStatus === "missing" ? "warning" : "default"
    },
    {
      id: "notify",
      label: "Bildirim",
      value: notificationStatusLabel(delivery),
      tone: delivery.confirmation?.customerNotified ? "success" : "default"
    }
  ];
}

export function buildDeliveryInfoFields(delivery: Delivery, customer: Customer | null) {
  return [
    { label: "Teslim no", value: delivery.deliveryNo },
    { label: "Sipariş no", value: delivery.orderNo ?? "—" },
    { label: "Cari", value: customer?.name ?? "—" },
    { label: "Planlanan tarih", value: dateLabel(delivery.plannedAt) },
    { label: "Teslim tarihi", value: delivery.deliveredAt ? dateLabel(delivery.deliveredAt) : "—" },
    { label: "Belge durumu", value: documentStatusLabel(delivery.documentStatus) },
    { label: "Durum", value: getDeliveryStatusLabel(delivery.status) },
    { label: "Hazırlanan toplam", value: delivery.lines.length > 0 ? String(preparedTotalFromLines(delivery)) : "—" },
    { label: "Açıklama", value: delivery.note?.trim() || "—", full: true as const }
  ];
}

function preparedTotalFromLines(delivery: Delivery): number {
  return delivery.lines.reduce((sum, line) => sum + (line.preparedQuantity ?? 0), 0);
}

export function buildQuickDeliveryContinueHref(orderId?: string, customerId?: string): string {
  const params = new URLSearchParams({ tab: "delivery" });
  if (orderId) {
    params.set("order", orderId);
  }
  if (customerId) {
    params.set("customer", customerId);
  }
  return `/hizli-islem/satis-masasi?${params.toString()}`;
}
