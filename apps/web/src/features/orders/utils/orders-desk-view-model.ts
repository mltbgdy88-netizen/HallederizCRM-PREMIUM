// @ts-nocheck
import type { Customer, OrderDeliveryStatus, OrderPaymentStatus, SaleOrder } from "@hallederiz/types";
import { summarizeOrderOperationalImpact } from "@hallederiz/domain";
import { getDeliveryStatusLabel, getOrderStatusLabel } from "../queries/order-mock-data";
import { dateLabel, formatTryMoney } from "./format";
import type { LucideIconName } from "../../../components/icons/lucide-icons";

export type OrdersDeskChip = "all" | "preparing" | "shipment" | "payment_pending" | "completed";

export type OrdersDeskBadgeTone = "success" | "warning" | "danger" | "neutral" | "info" | "gold";

export type OrdersDeskPaymentBreakdown = {
  hasInfo: boolean;
  totalLabel: string;
  paidLabel: string;
  remainingLabel: string;
  remainingTone: "success" | "gold" | "danger";
  lastCollectionLabel: string | null;
  statusLabel: string;
  statusTone: OrdersDeskBadgeTone;
  showCollectionLink: boolean;
};

export type OrdersDeskStat = {
  id: string;
  label: string;
  value: string;
  subtitle: string;
  icon: LucideIconName;
  tone: "emerald" | "ruby" | "gold" | "info" | "muted";
};

export type OrdersDeskRow = {
  orderId: string;
  orderNo: string;
  customerName: string;
  dateLabel: string;
  totalLabel: string;
  invoiceLabel: string;
  invoiceTone: OrdersDeskBadgeTone;
  paymentLabel: string;
  paymentTone: OrdersDeskBadgeTone;
  shipmentLabel: string;
  shipmentTone: OrdersDeskBadgeTone;
  statusLabel: string;
  statusTone: OrdersDeskBadgeTone;
  channelHint: string;
};

const TERMINAL_STATUSES = new Set<SaleOrder["status"]>(["completed", "cancelled", "delivered"]);

export function mapPaymentDeskBadge(order: SaleOrder): { label: string; tone: OrdersDeskBadgeTone } {
  const status = order.paymentStatus;

  if (!status) {
    return { label: "Tahsilat bilgisi yok", tone: "neutral" };
  }

  if (status === "paid" || status === "overpaid") {
    return { label: "Ã–dendi", tone: "success" };
  }

  if (status === "partial") {
    return { label: "KÄ±smi", tone: "gold" };
  }

  if (status === "unpaid" && isOrderAtRisk(order)) {
    return { label: "Vadesi geldi", tone: "danger" };
  }

  if (status === "unpaid") {
    return { label: "Bekliyor", tone: "gold" };
  }

  return { label: "Tahsilat bilgisi yok", tone: "neutral" };
}

export function mapShipmentDeskBadge(status: OrderDeliveryStatus | undefined): { label: string; tone: OrdersDeskBadgeTone } {
  if (!status || status === "none") {
    return { label: "Bekliyor", tone: "gold" };
  }

  if (status === "delivered") {
    return { label: "Teslim edildi", tone: "success" };
  }

  if (status === "preparing") {
    return { label: "HazÄ±rlanÄ±yor", tone: "info" };
  }

  if (status === "ready") {
    return { label: "Sevk edildi", tone: "info" };
  }

  if (status === "partial") {
    return { label: "KÄ±smi sevk", tone: "warning" };
  }

  return { label: getDeliveryStatusLabel(status), tone: "gold" };
}

export function mapOrderStatusDeskBadge(order: SaleOrder): { label: string; tone: OrdersDeskBadgeTone } {
  if (order.status === "cancelled") {
    return { label: getOrderStatusLabel(order.status), tone: "danger" };
  }

  if (order.status === "completed" || order.status === "delivered") {
    return { label: getOrderStatusLabel(order.status), tone: "success" };
  }

  if (order.status === "waiting_stock") {
    return { label: getOrderStatusLabel(order.status), tone: "danger" };
  }

  if (order.status === "in_preparation") {
    return { label: getOrderStatusLabel(order.status), tone: "info" };
  }

  if (order.status === "confirmed") {
    return { label: getOrderStatusLabel(order.status), tone: "info" };
  }

  return { label: getOrderStatusLabel(order.status), tone: "info" };
}

export function mapInvoiceDeskBadge(order: SaleOrder): { label: string; tone: OrdersDeskBadgeTone } {
  if (order.status === "completed" || order.status === "delivered") {
    return { label: "Kesildi", tone: "success" };
  }
  if (order.status === "cancelled") {
    return { label: "Ä°ptal", tone: "danger" };
  }
  return { label: "Bekliyor", tone: "gold" };
}

export function isOrderAtRisk(order: SaleOrder): boolean {
  if (TERMINAL_STATUSES.has(order.status)) {
    return false;
  }

  const updated = new Date(order.updatedAt).getTime();
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return order.paymentStatus === "unpaid" || order.status === "waiting_stock" || updated < weekAgo;
}

export function isDeliveredToday(order: SaleOrder): boolean {
  if (order.deliveryStatus !== "delivered") {
    return false;
  }

  const updated = new Date(order.updatedAt);
  const now = new Date();
  return (
    updated.getFullYear() === now.getFullYear() &&
    updated.getMonth() === now.getMonth() &&
    updated.getDate() === now.getDate()
  );
}

export function buildOrdersDeskStats(orders: SaleOrder[]): OrdersDeskStat[] {
  const openCount = orders.filter((o) => !TERMINAL_STATUSES.has(o.status)).length;
  const shipmentPending = orders.filter(
    (o) => o.deliveryStatus === "preparing" || o.deliveryStatus === "ready" || o.deliveryStatus === "partial"
  ).length;
  const paymentPending = orders.filter((o) => o.paymentStatus === "unpaid" || o.paymentStatus === "partial").length;
  const deliveredToday = orders.filter(isDeliveredToday).length;
  const atRisk = orders.filter(isOrderAtRisk).length;
  const liveHint = orders.length === 0 ? "CanlÄ± veri bekleniyor" : "";

  return [
    {
      id: "open",
      label: "AÃ§Ä±k SipariÅŸ",
      value: String(openCount),
      subtitle: liveHint,
      icon: "shopping-cart",
      tone: "emerald"
    },
    {
      id: "shipment",
      label: "Sevkiyat Bekleyen",
      value: String(shipmentPending),
      subtitle: liveHint,
      icon: "truck",
      tone: "info"
    },
    {
      id: "payment",
      label: "Ã–deme Bekleyen",
      value: String(paymentPending),
      subtitle: liveHint,
      icon: "circle-dollar-sign",
      tone: "gold"
    },
    {
      id: "today",
      label: "BugÃ¼n Teslim",
      value: String(deliveredToday),
      subtitle: liveHint,
      icon: "package-check",
      tone: "emerald"
    },
    {
      id: "risk",
      label: "Riskli / Geciken",
      value: String(atRisk),
      subtitle: liveHint,
      icon: "alert-triangle",
      tone: "ruby"
    }
  ];
}

export function mapOrdersDeskRow(order: SaleOrder, customers: Customer[]): OrdersDeskRow {
  const customer = customers.find((item) => item.id === order.customerId);
  const payment = mapPaymentDeskBadge(order);
  const shipment = mapShipmentDeskBadge(order.deliveryStatus);
  const status = mapOrderStatusDeskBadge(order);
  const invoice = mapInvoiceDeskBadge(order);

  return {
    orderId: order.id,
    orderNo: order.orderNo,
    customerName: customer?.name ?? "Cari bilgisi bekleniyor",
    dateLabel: dateLabel(order.createdAt),
    totalLabel: order.grandTotal ? formatTryMoney(order.grandTotal, order.currency) : "â€”",
    invoiceLabel: invoice.label,
    invoiceTone: invoice.tone,
    paymentLabel: payment.label,
    paymentTone: payment.tone,
    shipmentLabel: shipment.label,
    shipmentTone: shipment.tone,
    statusLabel: status.label,
    statusTone: status.tone,
    channelHint: order.orderNo
  };
}

export function matchesOrdersDeskChip(order: SaleOrder, chip: OrdersDeskChip): boolean {
  if (chip === "all") {
    return true;
  }

  if (chip === "preparing") {
    return order.status === "in_preparation" || order.deliveryStatus === "preparing";
  }

  if (chip === "shipment") {
    return order.deliveryStatus === "preparing" || order.deliveryStatus === "ready" || order.deliveryStatus === "partial";
  }

  if (chip === "payment_pending") {
    return order.paymentStatus === "unpaid" || order.paymentStatus === "partial";
  }

  return order.status === "completed" || order.status === "delivered";
}

export function paymentBreakdownForPreview(order: SaleOrder): OrdersDeskPaymentBreakdown {
  const status = mapPaymentDeskBadge(order);
  const paid = order.paidTotal ?? 0;
  const total = order.grandTotal ?? 0;
  const remaining = Math.max(0, total - paid);
  const hasPaymentActivity = paid > 0 || order.paymentStatus === "paid" || order.paymentStatus === "partial" || order.paymentStatus === "overpaid";

  if (!order.paymentStatus && total <= 0) {
    return {
      hasInfo: false,
      totalLabel: "â€”",
      paidLabel: "â€”",
      remainingLabel: "â€”",
      remainingTone: "gold",
      lastCollectionLabel: null,
      statusLabel: status.label,
      statusTone: status.tone,
      showCollectionLink: true
    };
  }

  let remainingTone: OrdersDeskPaymentBreakdown["remainingTone"] = "gold";
  if (remaining <= 0) {
    remainingTone = "success";
  } else if (order.paymentStatus === "unpaid" && isOrderAtRisk(order)) {
    remainingTone = "danger";
  }

  return {
    hasInfo: true,
    totalLabel: formatTryMoney(total, order.currency),
    paidLabel: formatTryMoney(paid, order.currency),
    remainingLabel: formatTryMoney(remaining, order.currency),
    remainingTone,
    lastCollectionLabel: hasPaymentActivity ? dateLabel(order.updatedAt) : null,
    statusLabel: status.label,
    statusTone: status.tone,
    showCollectionLink: order.paymentStatus !== "paid" && order.paymentStatus !== "overpaid"
  };
}

export function fulfillmentSummaryForPreview(order: SaleOrder): { headline: string; detail: string; tone: OrdersDeskBadgeTone } {
  const shipment = mapShipmentDeskBadge(order.deliveryStatus);
  const impact = summarizeOrderOperationalImpact(order);

  return {
    headline: shipment.label,
    detail: impact.needsFactoryOrder ? "Depo + fabrika kaynak planÄ±" : "Merkez depo sevkiyatÄ±",
    tone: shipment.tone
  };
}

export const ORDERS_DESK_CHIPS: { id: OrdersDeskChip; label: string }[] = [
  { id: "all", label: "TÃ¼mÃ¼" },
  { id: "preparing", label: "HazÄ±rlanÄ±yor" },
  { id: "shipment", label: "Sevkiyat" },
  { id: "payment_pending", label: "Ã–deme Bekliyor" },
  { id: "completed", label: "Tamamlanan" }
];

