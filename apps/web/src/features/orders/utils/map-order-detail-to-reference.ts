import type { Customer, Delivery, Invoice, PaymentReceipt, SaleOrder, WarehouseOrder } from "@hallederiz/types";
import type { OrderDetailSideData } from "../queries/get-order-detail-side-data";
import { dateLabel, formatTryMoney, money } from "./format";
import {
  getDeliveryStatusLabel,
  getOrderChannelLabel,
  getOrderStatusLabel,
  getPaymentStatusLabel
} from "../queries/order-mock-data";

export type OrderReferenceLayerKey =
  | "ozet"
  | "satirlar"
  | "odeme-tahsilat"
  | "teslimat"
  | "fatura"
  | "iade"
  | "depo-stok-etkisi"
  | "timeline";

export type OrderReferenceKpi = {
  label: string;
  value: string;
  hint: string;
  tone?: "success" | "warning" | "info";
};

export type OrderScopedSideData = {
  payments: PaymentReceipt[];
  warehouseOrders: WarehouseOrder[];
  deliveries: Delivery[];
  invoices: Invoice[];
};

export type OrderTimelineEvent = {
  id: string;
  title: string;
  date: string;
};

export type OrderReferenceModel = {
  headerMeta: string;
  kpis: OrderReferenceKpi[];
  openBalance: string;
  paymentStatusLabel: string;
  deliveryStatusLabel: string;
  invoiceStatusLabel: string;
  lineCount: number;
  allocatedPaymentTotal: number;
  timelineEvents: OrderTimelineEvent[];
};

export const ORDER_LAYER_TITLES: Record<OrderReferenceLayerKey, string> = {
  ozet: "Sipariş Özeti",
  satirlar: "Sipariş Satırları",
  "odeme-tahsilat": "Ödeme ve Tahsilat",
  teslimat: "Teslimat",
  fatura: "Fatura",
  iade: "İade",
  "depo-stok-etkisi": "Depo Stok Etkisi",
  timeline: "Zaman Akışı"
};

export function scopeOrderSideData(orderId: string, side: OrderDetailSideData): OrderScopedSideData {
  return {
    payments: side.payments.filter((payment) =>
      payment.allocations.some((allocation) => allocation.targetId === orderId && allocation.targetType === "order")
    ),
    warehouseOrders: side.warehouseOrders.filter((warehouseOrder) => warehouseOrder.orderId === orderId),
    deliveries: side.deliveries.filter((delivery) => delivery.orderId === orderId),
    invoices: side.invoices.filter((invoice) => invoice.orderId === orderId)
  };
}

function invoiceStatusLabel(invoices: Invoice[]): string {
  const invoice = invoices[0];
  if (!invoice) {
    return "—";
  }
  if (invoice.status === "issued") {
    return "Kesildi";
  }
  if (invoice.status === "draft") {
    return "Taslak";
  }
  if (invoice.status === "cancelled") {
    return "İptal";
  }
  return invoice.status;
}

function deliveryRecordLabel(deliveries: Delivery[]): string {
  const delivery = deliveries[0];
  if (!delivery) {
    return "—";
  }
  return delivery.deliveryNo;
}

export function buildOrderTimelineEvents(
  order: SaleOrder,
  scoped: OrderScopedSideData
): OrderTimelineEvent[] {
  const events: OrderTimelineEvent[] = [
    { id: "created", title: "Sipariş oluşturuldu", date: order.createdAt }
  ];

  if (order.confirmedAt) {
    events.push({ id: "confirmed", title: "Sipariş onaylandı", date: order.confirmedAt });
  }

  for (const payment of scoped.payments) {
    events.push({
      id: `payment-${payment.id}`,
      title: `${payment.receiptNo} tahsilat bağlandı`,
      date: payment.receivedAt
    });
  }

  for (const warehouseOrder of scoped.warehouseOrders) {
    events.push({
      id: `wh-${warehouseOrder.id}`,
      title: `${warehouseOrder.warehouseOrderNo} depo emri`,
      date: warehouseOrder.createdAt
    });
  }

  for (const delivery of scoped.deliveries) {
    events.push({
      id: `del-${delivery.id}`,
      title: `${delivery.deliveryNo} teslimat`,
      date: delivery.deliveredAt ?? delivery.createdAt
    });
  }

  for (const invoice of scoped.invoices) {
    events.push({
      id: `inv-${invoice.id}`,
      title: `${invoice.invoiceNo} fatura`,
      date: invoice.issueDate ?? invoice.createdAt
    });
  }

  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function buildOrderReferenceModel(
  order: SaleOrder,
  customer: Customer | null,
  scoped: OrderScopedSideData
): OrderReferenceModel {
  const openAmount = Math.max(order.grandTotal - order.paidTotal, 0);
  const allocatedPaymentTotal = scoped.payments.reduce((sum, payment) => {
    const forOrder = payment.allocations
      .filter((allocation) => allocation.targetId === order.id && allocation.targetType === "order")
      .reduce((inner, allocation) => inner + allocation.allocatedAmount, 0);
    return sum + forOrder;
  }, 0);

  const customerName = customer?.name ?? order.customerId;
  const headerMeta = `${order.orderNo} · ${customerName} · ${dateLabel(order.createdAt)}`;

  const kpis: OrderReferenceKpi[] = [
    {
      label: "Sipariş tutarı",
      value: formatTryMoney(order.grandTotal, order.currency),
      hint: order.orderNo,
      tone: "success"
    },
    {
      label: "Tahsilat durumu",
      value: getPaymentStatusLabel(order.paymentStatus),
      hint: scoped.payments.length > 0 ? `${scoped.payments.length} kayıt` : "—",
      tone: order.paymentStatus === "paid" ? "success" : order.paymentStatus === "partial" ? "warning" : undefined
    },
    {
      label: "Teslim durumu",
      value: getDeliveryStatusLabel(order.deliveryStatus),
      hint: deliveryRecordLabel(scoped.deliveries),
      tone: order.deliveryStatus === "delivered" ? "success" : undefined
    },
    {
      label: "Fatura durumu",
      value: invoiceStatusLabel(scoped.invoices),
      hint: scoped.invoices[0]?.invoiceNo ?? "—"
    },
    {
      label: "Satır sayısı",
      value: String(order.lines.length),
      hint: getOrderStatusLabel(order.status)
    },
    {
      label: "Açık tutar",
      value: formatTryMoney(openAmount, order.currency),
      hint: openAmount > 0 ? "Risk / tahsilat" : "Kapalı",
      tone: openAmount > 0 ? "warning" : "success"
    }
  ];

  return {
    headerMeta,
    kpis,
    openBalance: formatTryMoney(openAmount, order.currency),
    paymentStatusLabel: getPaymentStatusLabel(order.paymentStatus),
    deliveryStatusLabel: getDeliveryStatusLabel(order.deliveryStatus),
    invoiceStatusLabel: invoiceStatusLabel(scoped.invoices),
    lineCount: order.lines.length,
    allocatedPaymentTotal,
    timelineEvents: buildOrderTimelineEvents(order, scoped)
  };
}

export function buildQuickOrderHref(orderId: string, customerId?: string): string {
  const params = new URLSearchParams({ tab: "order", order: orderId });
  if (customerId) {
    params.set("customer", customerId);
  }
  return `/hizli-islem/satis-masasi?${params.toString()}`;
}

export function buildQuickDeliveryHref(orderId: string, customerId?: string): string {
  const params = new URLSearchParams({ tab: "delivery", order: orderId });
  if (customerId) {
    params.set("customer", customerId);
  }
  return `/hizli-islem/satis-masasi?${params.toString()}`;
}

export function buildQuickReturnHref(orderId: string, customerId?: string): string {
  const params = new URLSearchParams({ tab: "return", order: orderId });
  if (customerId) {
    params.set("customer", customerId);
  }
  return `/hizli-islem/satis-masasi?${params.toString()}`;
}

export { getOrderChannelLabel, getOrderStatusLabel, money };
