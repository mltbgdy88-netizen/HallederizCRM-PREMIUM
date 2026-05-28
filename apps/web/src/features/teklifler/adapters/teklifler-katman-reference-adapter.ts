// @ts-nocheck
import type { Customer, Offer } from "@hallederiz/types";
import { REFERENCE_DEMO_BANNER } from "../../../lib/reference/constants";
import { REFERENCE_ROUTE_IDS } from "../../../lib/reference/reference-route-ids";
import { formatTrDateTime, formatTryMoney } from "../../../lib/reference/formatters";
import { getOfferDetail } from "../../offers/queries/get-offers";
import { getOfferStatusLabel } from "../../offers/queries/offer-mock-data";
import {
  buildTekliflerKatmanLayer,
  type TekliflerKatmanLayerSnapshot
} from "./teklifler-katman-layer";

export type { TekliflerKatmanLayerSnapshot };

export type TeklifKatmanLine = {
  code: string;
  name: string;
  desc: string;
  qty: string;
  unit: string;
  price: string;
  discPct: string;
  discAmt: string;
  vat: string;
  total: string;
};

export type TekliflerKatmanReferenceSnapshot = {
  offerId: string;
  demoBanner: string | null;
  layer: TekliflerKatmanLayerSnapshot;
  header: {
    breadcrumb: string[];
    title: string;
    quoteId: string;
    status: string;
    customer: string;
    offerDate: string;
    validUntil: string;
    currency: string;
    total: string;
    creator: string;
  };
  lines: TeklifKatmanLine[];
  summary: { label: string; value: string; strong?: boolean }[];
};

function mapLines(offer: Offer): TeklifKatmanLine[] {
  return (offer.lines ?? []).map((line, index) => {
    const discountAmount = Math.max(0, line.quantity * line.unitPrice - line.lineTotal);
    const discountPct = line.quantity * line.unitPrice > 0
      ? (discountAmount / (line.quantity * line.unitPrice)) * 100
      : 0;
    return {
      code: line.productCode || `UR-${index + 1}`,
      name: line.productName || "Ürün",
      desc: line.productName || "Teklif kalemi",
      qty: String(line.quantity),
      unit: "Adet",
      price: formatTryMoney(line.unitPrice, line.currency),
      discPct: `%${Math.round(discountPct)}`,
      discAmt: formatTryMoney(discountAmount, line.currency),
      vat: `${Math.round((offer.taxRate ?? 0) * 100)}%`,
      total: formatTryMoney(line.lineTotal, line.currency)
    };
  });
}

function buildSnapshot(offer: Offer, customer?: Customer, demoBanner: string | null = null): TekliflerKatmanReferenceSnapshot {
  const lines = mapLines(offer);
  const discountTotal = Math.max(0, (offer.subtotal ?? 0) + (offer.taxTotal ?? 0) - offer.grandTotal);
  return {
    offerId: offer.id,
    demoBanner,
    header: {
      breadcrumb: ["Ana Sayfa", "Teklifler", offer.offerNo],
      title: "Teklifler",
      quoteId: offer.offerNo,
      status: getOfferStatusLabel(offer.status),
      customer: customer?.name ?? "—",
      offerDate: formatTrDateTime(offer.createdAt),
      validUntil: offer.validUntil ? formatTrDateTime(offer.validUntil) : "—",
      currency: offer.currency,
      total: formatTryMoney(offer.grandTotal, offer.currency),
      creator: "Sistem"
    },
    lines,
    summary: [
      { label: "Ara Toplam", value: formatTryMoney(offer.subtotal ?? 0, offer.currency) },
      { label: "Toplam İskonto", value: formatTryMoney(discountTotal, offer.currency) },
      { label: "KDV", value: formatTryMoney(offer.taxTotal ?? 0, offer.currency) },
      { label: "Genel Toplam", value: formatTryMoney(offer.grandTotal, offer.currency), strong: true }
    ]
  };
}

export function loadTekliflerKatmanReferenceDemo(): TekliflerKatmanReferenceSnapshot {
  const offerNo = REFERENCE_ROUTE_IDS.offerId;
  return {
    offerId: REFERENCE_ROUTE_IDS.offerId,
    demoBanner: REFERENCE_DEMO_BANNER,
    layer: buildTekliflerKatmanLayer(),
    header: {
      breadcrumb: ["Ana Sayfa", "Teklifler", offerNo],
      title: "Teklifler",
      quoteId: offerNo,
      status: "Açık",
      customer: "—",
      offerDate: "—",
      validUntil: "—",
      currency: "TRY",
      total: "₺0,00",
      creator: "Sistem"
    },
    lines: [],
    summary: [{ label: "Genel Toplam", value: "₺0,00", strong: true }]
  };
}

export async function loadTekliflerKatmanReferenceLive(offerId?: string): Promise<TekliflerKatmanReferenceSnapshot> {
  const resolved = (offerId ?? REFERENCE_ROUTE_IDS.offerId).trim() || REFERENCE_ROUTE_IDS.offerId;
  const { offer, offers, customers } = await getOfferDetail(resolved);
  const selected = offer ?? offers[0];
  if (!selected) {
    return loadTekliflerKatmanReferenceDemo();
  }
  const customer = customers.find((c) => c.id === selected.customerId);
  return buildSnapshot(selected, customer);
}

