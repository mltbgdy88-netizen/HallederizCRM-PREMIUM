// @ts-nocheck
import type { Customer, SaleOrder } from "@hallederiz/types";
import { REFERENCE_DEMO_BANNER } from "../../../lib/reference/constants";
import { REFERENCE_ROUTE_IDS } from "../../../lib/reference/reference-route-ids";
import {
  fulfillmentFromDemoRow,
  fulfillmentFromSaleOrder,
  type SiparisFulfillment
} from "../../../lib/siparis-fulfillment-links";
import { formatTrDateTime, formatTryMoney } from "../../../lib/reference/formatters";
import { mapOrderRow } from "../../orders/mappers/map-order-row";
import { getOrders } from "../../orders/queries/get-orders";
import {
  getDeliveryStatusLabel,
  getOrderChannelLabel,
  getOrderStatusLabel,
  getPaymentStatusLabel
} from "../../orders/queries/order-mock-data";
import {
  SDM_APPROVAL,
  SDM_DELIVERY,
  SDM_FIN_KPIS,
  SDM_INFO_LEFT,
  SDM_INFO_RIGHT,
  SDM_INVOICE,
  SDM_LINE_TOTALS,
  SDM_LINES,
  SDM_NOTES,
  SDM_PAGE,
  SDM_TABS,
  type SdmTab
} from "../data/siparisler-detay-mock";

const DEMO_DETAY_FULFILLMENT = fulfillmentFromDemoRow({
  salesOrderId: REFERENCE_ROUTE_IDS.orderId,
  kind: "bolunmus",
  label: "Merkez depo + fabrika üretimi",
  factoryOrderId: REFERENCE_ROUTE_IDS.factoryOrderId,
  warehouseOrderId: REFERENCE_ROUTE_IDS.warehouseOrderId
});

export type SiparislerDetayReferenceSnapshot = {
  orderId: string;
  fulfillment: SiparisFulfillment;
  page: {
    breadcrumb: string[];
    title: string;
    orderId: string;
    status: string;
    orderDate: string;
  };
  finKpis: typeof SDM_FIN_KPIS;
  tabs: readonly SdmTab[];
  infoLeft: { label: string; value: string; full?: boolean }[];
  infoRight: {
    label: string;
    value: string;
    badge?: string;
    avatar?: string;
  }[];
  lines: {
    no: string;
    code: string;
    name: string;
    qty: string;
    unit: string;
    price: string;
    disc: string;
    tax: string;
    total: string;
  }[];
  lineTotals: { label: string; value: string; strong?: boolean; warn?: boolean }[];
  approval: { title: string; time: string; done: boolean; active?: boolean }[];
  delivery: typeof SDM_DELIVERY;
  invoice: typeof SDM_INVOICE;
  notes: typeof SDM_NOTES;
  asideCustomer: string;
  demoBanner: string | null;
};

function cloneDemoSnapshot(): SiparislerDetayReferenceSnapshot {
  return {
    orderId: REFERENCE_ROUTE_IDS.orderId,
    fulfillment: DEMO_DETAY_FULFILLMENT,
    demoBanner: null,
    page: {
      breadcrumb: [...SDM_PAGE.breadcrumb],
      title: SDM_PAGE.title,
      orderId: SDM_PAGE.orderId,
      status: SDM_PAGE.status,
      orderDate: SDM_PAGE.orderDate
    },
    finKpis: SDM_FIN_KPIS.map((k) => ({ ...k })),
    tabs: SDM_TABS,
    infoLeft: SDM_INFO_LEFT.map((f) => ({ ...f })),
    infoRight: SDM_INFO_RIGHT.map((f) => ({ ...f })),
    lines: SDM_LINES.map((l) => ({ ...l })),
    lineTotals: SDM_LINE_TOTALS.map((t) => ({ ...t })),
    approval: SDM_APPROVAL.map((a) => ({ ...a })),
    delivery: { ...SDM_DELIVERY },
    invoice: { ...SDM_INVOICE },
    notes: { ...SDM_NOTES },
    asideCustomer: SDM_INFO_LEFT.find((f) => f.label === "Müşteri")?.value ?? "—"
  };
}

function buildApprovalSteps(order: SaleOrder): SiparislerDetayReferenceSnapshot["approval"] {
  const created = formatTrDateTime(order.createdAt);
  const updated = formatTrDateTime(order.updatedAt);
  const status = order.status;
  const steps: SiparislerDetayReferenceSnapshot["approval"] = [
    { title: "Sipariş Oluşturuldu", time: created, done: true },
    {
      title: "Onay Bekliyor",
      time: updated,
      done: status !== "draft",
      active: status === "waiting_approval"
    },
    {
      title: getOrderStatusLabel(status),
      time: order.confirmedAt ? formatTrDateTime(order.confirmedAt) : updated,
      done: status === "confirmed" || status === "completed" || status === "delivered",
      active: status === "confirmed"
    }
  ];
  return steps;
}

function buildLiveSnapshot(
  order: SaleOrder,
  customers: Customer[],
  demoBanner: string | null
): SiparislerDetayReferenceSnapshot {
  const row = mapOrderRow(order, customers);
  const customer = customers.find((c) => c.id === order.customerId);
  const discount = Math.max(0, (order.subtotal ?? 0) + (order.taxTotal ?? 0) - order.grandTotal);
  const remaining = Math.max(0, order.grandTotal - (order.paidTotal ?? 0));
  const deliveredLines = (order.lines ?? []).filter((l) => l.deliveredQuantity > 0).length;
  const totalLines = order.lines?.length ?? 0;

  return {
    orderId: order.id,
    fulfillment: fulfillmentFromSaleOrder(order),
    demoBanner,
    page: {
      breadcrumb: ["Siparişler", "Sipariş Detayı"],
      title: "Sipariş",
      orderId: order.orderNo,
      status: row.statusLabel,
      orderDate: `Sipariş Tarihi: ${formatTrDateTime(order.createdAt)}`
    },
    finKpis: [
      { id: "amount", label: "Sipariş Tutarı", value: formatTryMoney(order.subtotal ?? order.grandTotal, order.currency), tone: "green" },
      { id: "discount", label: "İskonto Toplamı", value: formatTryMoney(discount, order.currency), tone: "gold" },
      { id: "tax", label: "Vergi Toplamı", value: formatTryMoney(order.taxTotal ?? 0, order.currency), tone: "teal" },
      { id: "gross", label: "KDV Dahil Toplam", value: formatTryMoney(order.grandTotal, order.currency), tone: "green" },
      { id: "paid", label: "Ödenen Tutar", value: formatTryMoney(order.paidTotal ?? 0, order.currency), tone: "blue" },
      { id: "remaining", label: "Kalan Tutar", value: formatTryMoney(remaining, order.currency), tone: "orange" }
    ],
    tabs: SDM_TABS,
    infoLeft: [
      { label: "Sipariş No", value: order.orderNo },
      { label: "Sipariş Tarihi", value: formatTrDateTime(order.createdAt) },
      { label: "Müşteri", value: customer?.name ?? row.customerName },
      { label: "Cari Kodu", value: customer?.code ?? "—" },
      { label: "Telefon", value: customer?.phone ?? "—" },
      { label: "E-posta", value: customer?.email ?? "—" },
      { label: "Adres", value: customer?.addressLine ?? "—", full: true },
      { label: "Sipariş Kaynağı", value: getOrderChannelLabel(order.channel) },
      { label: "Açıklama", value: order.note ?? "—", full: true }
    ],
    infoRight: [
      { label: "Durum", value: row.statusLabel, badge: "ok" },
      { label: "Ödeme", value: getPaymentStatusLabel(order.paymentStatus) },
      { label: "Para Birimi", value: order.currency },
      { label: "Fiyat Slotu", value: order.priceSlotLabelSnapshot },
      { label: "Teslimat", value: getDeliveryStatusLabel(order.deliveryStatus) },
      { label: "Son Güncelleme", value: formatTrDateTime(order.updatedAt) }
    ],
    lines: (order.lines ?? []).map((line, index) => ({
      no: String(index + 1),
      code: line.productCode,
      name: line.productName,
      qty: String(line.quantity),
      unit: "Adet",
      price: formatTryMoney(line.unitPrice, line.currency),
      disc: "0,00",
      tax: String(Math.round((order.taxRate ?? 0) * 100)),
      total: formatTryMoney(line.lineTotal, line.currency)
    })),
    lineTotals: [
      { label: "Ara Toplam", value: formatTryMoney(order.subtotal ?? 0, order.currency) },
      { label: "Vergi Toplamı", value: formatTryMoney(order.taxTotal ?? 0, order.currency) },
      { label: "KDV Dahil Toplam", value: formatTryMoney(order.grandTotal, order.currency), strong: true },
      { label: "Ödenen Tutar", value: formatTryMoney(order.paidTotal ?? 0, order.currency) },
      { label: "Kalan Tutar", value: formatTryMoney(remaining, order.currency), warn: remaining > 0 }
    ],
    approval: buildApprovalSteps(order),
    delivery: {
      status: getDeliveryStatusLabel(order.deliveryStatus),
      planned: formatTrDateTime(order.updatedAt),
      progress: totalLines ? `${deliveredLines} / ${totalLines} satır teslim edildi` : "—",
      cta: "Teslimatları Görüntüle"
    },
    invoice: { text: "Fatura bağlantısı ERP üzerinden", cta: "Fatura Oluştur" },
    notes: { placeholder: SDM_NOTES.placeholder, sample: order.note ?? "" },
    asideCustomer: customer?.name ?? row.customerName
  };
}

export const SIPARISLER_DETAY_REFERENCE_INITIAL = cloneDemoSnapshot();

export function loadSiparislerDetayReferenceDemo(): SiparislerDetayReferenceSnapshot {
  return cloneDemoSnapshot();
}

export async function loadSiparislerDetayReferenceLive(
  orderId: string
): Promise<SiparislerDetayReferenceSnapshot> {
  const { orders, customers } = await getOrders();
  const order = orders.find((o) => o.id === orderId) ?? orders[0];
  if (!order) {
    return { ...cloneDemoSnapshot(), demoBanner: REFERENCE_DEMO_BANNER };
  }
  return buildLiveSnapshot(order, customers, null);
}

