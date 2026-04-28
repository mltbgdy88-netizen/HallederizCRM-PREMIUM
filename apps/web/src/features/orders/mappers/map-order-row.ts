import { summarizeOrderOperationalImpact } from "@hallederiz/domain";
import type { Customer, SaleOrder } from "@hallederiz/types";
import { dateLabel, money } from "../utils/format";
import { getDeliveryStatusLabel, getOrderChannelLabel, getOrderStatusLabel, getPaymentStatusLabel } from "../queries/order-mock-data";

export interface OrderRow {
  orderId: string;
  orderNo: string;
  customerName: string;
  totalLabel: string;
  statusLabel: string;
  paymentStatusLabel: string;
  deliveryStatusLabel: string;
  channelLabel: string;
  sourceSummary: string;
  lastActionLabel: string;
  statusTone: "info" | "success" | "warning" | "danger" | "neutral";
}

function resolveStatusTone(order: SaleOrder): OrderRow["statusTone"] {
  if (order.status === "cancelled" || order.paymentStatus === "unpaid") {
    return "danger";
  }

  if (order.status === "waiting_stock" || order.deliveryStatus === "preparing") {
    return "warning";
  }

  if (order.status === "completed" || order.status === "delivered") {
    return "success";
  }

  return "info";
}

export function mapOrderRow(order: SaleOrder, customers: Customer[]): OrderRow {
  const customer = customers.find((item) => item.id === order.customerId);
  const impact = summarizeOrderOperationalImpact(order);

  return {
    orderId: order.id,
    orderNo: order.orderNo,
    customerName: customer?.name ?? order.customerId,
    totalLabel: money(order.grandTotal, order.currency),
    statusLabel: getOrderStatusLabel(order.status),
    paymentStatusLabel: getPaymentStatusLabel(order.paymentStatus),
    deliveryStatusLabel: getDeliveryStatusLabel(order.deliveryStatus),
    channelLabel: getOrderChannelLabel(order.channel),
    sourceSummary: impact.needsFactoryOrder ? "Depo + Fabrika" : "Merkez Depo",
    lastActionLabel: dateLabel(order.updatedAt),
    statusTone: resolveStatusTone(order)
  };
}
