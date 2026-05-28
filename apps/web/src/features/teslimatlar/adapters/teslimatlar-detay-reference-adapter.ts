// @ts-nocheck
import type { Customer, Delivery } from "@hallederiz/types";
import { REFERENCE_DEMO_BANNER } from "../../../lib/reference/constants";
import { REFERENCE_ROUTE_IDS } from "../../../lib/reference/reference-route-ids";
import { formatTrDateTime } from "../../../lib/reference/formatters";
import { getDeliveryDetail } from "../../deliveries/queries/get-deliveries";
import { getDeliveryStatusLabel } from "../../deliveries/queries/delivery-mock-data";
import {
  TSDM_ACTIONS,
  TSDM_CONTEXT,
  TSDM_LINE_FOOT,
  TSDM_LINES,
  TSDM_METRICS,
  TSDM_NOTE,
  TSDM_PAGE,
  TSDM_PROOF,
  TSDM_STATUS_CARDS
} from "../data/teslimatlar-detay-mock";

export type TeslimatlarDetayReferenceSnapshot = {
  deliveryId: string;
  demoBanner: string | null;
  page: { breadcrumb: string[]; title: string; subtitle: string };
  statusCards: { id: string; label: string; value: string; tone?: "success" }[];
  metrics: { label: string; value: string }[];
  lines: { id: string; code: string; name: string; qty: string; unit: string; price: string; total: string }[];
  lineFoot: { qty: string; total: string };
  note: string;
  context: {
    title: string;
    rows: { label: string; value: string; link?: boolean; full?: boolean }[];
  };
  proof: typeof TSDM_PROOF;
  actions: readonly string[];
};

function cloneDemoSnapshot(): TeslimatlarDetayReferenceSnapshot {
  return {
    deliveryId: REFERENCE_ROUTE_IDS.deliveryId,
    demoBanner: null,
    page: {
      breadcrumb: [...TSDM_PAGE.breadcrumb],
      title: TSDM_PAGE.title,
      subtitle: TSDM_PAGE.subtitle
    },
    statusCards: TSDM_STATUS_CARDS.map((c) => ({ ...c })),
    metrics: TSDM_METRICS.map((m) => ({ ...m })),
    lines: TSDM_LINES.map((l) => ({ ...l })),
    lineFoot: { ...TSDM_LINE_FOOT },
    note: TSDM_NOTE,
    context: {
      title: TSDM_CONTEXT.title,
      rows: TSDM_CONTEXT.rows.map((r) => ({ ...r }))
    },
    proof: { ...TSDM_PROOF },
    actions: TSDM_ACTIONS
  };
}

function buildLiveSnapshot(
  delivery: Delivery,
  customers: Customer[],
  demoBanner: string | null
): TeslimatlarDetayReferenceSnapshot {
  const customer = customers.find((c) => c.id === delivery.customerId);
  const lines = (delivery.lines ?? []).map((line) => ({
    id: line.id,
    code: line.productCode,
    name: line.productName,
    qty: String(line.deliveredQuantity || line.preparedQuantity || line.orderedQuantity),
    unit: "Adet",
    price: "—",
    total: "—"
  }));
  const totalQty = (delivery.lines ?? []).reduce(
    (s, l) => s + (l.deliveredQuantity || l.preparedQuantity || l.orderedQuantity),
    0
  );
  const statusLabel = getDeliveryStatusLabel(delivery.status);

  return {
    deliveryId: delivery.id,
    demoBanner,
    page: {
      breadcrumb: ["Teslimatlar", "Teslimat Detay"],
      title: `Teslimat ${delivery.deliveryNo}`,
      subtitle: delivery.orderNo
        ? `Sipariş ${delivery.orderNo} için teslimat kaydı.`
        : "Siparişe istinaden hazırlanmış teslimat kaydı."
    },
    statusCards: [
      { id: "status", label: "Teslimat Durumu", value: statusLabel, tone: delivery.status === "delivered" ? "success" : undefined },
      { id: "order", label: "Sipariş", value: delivery.orderNo ?? "—" },
      { id: "customer", label: "Müşteri", value: customer?.name ?? "—" },
      { id: "planned", label: "Planlanan", value: formatTrDateTime(delivery.plannedAt) },
      { id: "delivered", label: "Teslim", value: formatTrDateTime(delivery.deliveredAt) },
      { id: "document", label: "Belge", value: delivery.documentStatus === "sent" ? "Gönderildi" : "Eksik / hazırlanıyor" }
    ],
    metrics: [
      { label: "Toplam Kalem", value: String(lines.length) },
      { label: "Toplam Miktar", value: String(totalQty) },
      { label: "Hazırlanan", value: String((delivery.lines ?? []).reduce((s, l) => s + (l.preparedQuantity ?? 0), 0)) },
      { label: "Teslim Edilen", value: String((delivery.lines ?? []).reduce((s, l) => s + (l.deliveredQuantity ?? 0), 0)) },
      { label: "Belge Durumu", value: delivery.documentStatus }
    ],
    lines: lines.length ? lines : TSDM_LINES.map((l) => ({ ...l })),
    lineFoot: {
      qty: String(totalQty),
      total: lines.length ? "—" : TSDM_LINE_FOOT.total
    },
    note: delivery.note || delivery.confirmation?.note || TSDM_NOTE,
    context: {
      title: TSDM_CONTEXT.title,
      rows: [
        { label: "Sipariş", value: delivery.orderNo ?? "—", link: Boolean(delivery.orderNo) },
        { label: "Cari", value: customer?.name ?? "—" },
        {
          label: "Adres",
          value: [customer?.addressLine, customer?.district, customer?.city].filter(Boolean).join(", ") || "—",
          full: true
        },
        { label: "Teslim No", value: delivery.deliveryNo },
        { label: "Belge", value: delivery.documentStatus },
        { label: "Oluşturulma", value: formatTrDateTime(delivery.createdAt) }
      ]
    },
    proof: {
      receiver: customer?.name ?? TSDM_PROOF.receiver,
      receiverRole: customer?.name ? `${customer.name} yetkilisi` : TSDM_PROOF.receiverRole,
      signatureLabel: TSDM_PROOF.signatureLabel,
      photosLabel: TSDM_PROOF.photosLabel,
      photoCount: TSDM_PROOF.photoCount
    },
    actions: TSDM_ACTIONS
  };
}

export function loadTeslimatlarDetayReferenceDemo(): TeslimatlarDetayReferenceSnapshot {
  return { ...cloneDemoSnapshot(), demoBanner: REFERENCE_DEMO_BANNER };
}

export async function loadTeslimatlarDetayReferenceLive(
  deliveryId: string
): Promise<TeslimatlarDetayReferenceSnapshot> {
  const { delivery, customers } = await getDeliveryDetail(deliveryId);
  if (!delivery) {
    return { ...cloneDemoSnapshot(), demoBanner: null };
  }
  return buildLiveSnapshot(delivery, customers, null);
}

export const TESLIMATLAR_DETAY_REFERENCE_INITIAL = cloneDemoSnapshot();
