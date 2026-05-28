// @ts-nocheck
import type { Customer, Offer } from "@hallederiz/types";
import { REFERENCE_DEMO_BANNER } from "../../../lib/reference/constants";
import { REFERENCE_ROUTE_IDS } from "../../../lib/reference/reference-route-ids";
import { formatTrDateTime, formatTryMoney } from "../../../lib/reference/formatters";
import { mapOfferToRow } from "../../offers/mappers/map-offer-row";
import { getOffers } from "../../offers/queries/get-offers";
import { getOfferStatusLabel } from "../../offers/queries/offer-mock-data";
import {
  TDM_CONTEXT,
  TDM_CONVERT,
  TDM_HERO,
  TDM_KPIS,
  TDM_PAGE,
  TDM_SUMMARY_FIELDS,
  TDM_TABS,
  type TdmTab
} from "../data/teklifler-detay-mock";

export type TekliflerDetayReferenceSnapshot = {
  offerId: string;
  page: { breadcrumb: string[]; title: string };
  hero: typeof TDM_HERO;
  tabs: readonly TdmTab[];
  kpis: typeof TDM_KPIS;
  summaryFields: {
    label: string;
    value: string;
    full?: boolean;
    avatar?: string;
    tags?: string[];
  }[];
  context: typeof TDM_CONTEXT;
  convert: typeof TDM_CONVERT;
  demoBanner: string | null;
};

function cloneDemoSnapshot(): TekliflerDetayReferenceSnapshot {
  return {
    offerId: REFERENCE_ROUTE_IDS.offerId,
    demoBanner: null,
    page: { breadcrumb: [...TDM_PAGE.breadcrumb], title: TDM_PAGE.title },
    hero: { ...TDM_HERO },
    tabs: TDM_TABS,
    kpis: TDM_KPIS.map((k) => ({ ...k })),
    summaryFields: TDM_SUMMARY_FIELDS.map((f) => ({
      ...f,
      tags: "tags" in f && f.tags ? [...f.tags] : undefined
    })),
    context: {
      title: TDM_CONTEXT.title,
      rows: TDM_CONTEXT.rows.map((r) => ({ ...r }))
    },
    convert: { ...TDM_CONVERT }
  };
}

function buildLiveSnapshot(offer: Offer, customers: Customer[], demoBanner: string | null): TekliflerDetayReferenceSnapshot {
  const customer = customers.find((c) => c.id === offer.customerId);
  const row = mapOfferToRow(offer, customer);
  const discount = Math.max(0, (offer.subtotal ?? 0) + (offer.taxTotal ?? 0) - offer.grandTotal);

  return {
    offerId: offer.id,
    demoBanner,
    page: { breadcrumb: ["Teklifler", "Teklif Detayı"], title: "Teklif Detayı" },
    hero: {
      number: offer.offerNo,
      numberLabel: "Teklif Numarası",
      status: row.statusLabel,
      created: `Oluşturulma: ${formatTrDateTime(offer.createdAt)}`,
      updated: `Son Güncelleme: ${formatTrDateTime(offer.updatedAt)}`,
      customer: customer?.name ?? row.customerName,
      contact: customer?.name ?? "—",
      email: customer?.email ?? "—",
      total: formatTryMoney(offer.grandTotal, offer.currency),
      totalNote: "KDV Dahil"
    },
    tabs: TDM_TABS,
    kpis: [
      {
        id: "validity",
        label: "Geçerlilik Tarihi",
        value: offer.validUntil ? formatTrDateTime(offer.validUntil) : "—",
        sub: row.validUntilLabel,
        subTone: "warn",
        icon: "calendar"
      },
      {
        id: "total",
        label: "Toplam Tutar",
        value: formatTryMoney(offer.grandTotal, offer.currency),
        sub: "KDV Dahil",
        subTone: "muted",
        icon: "money"
      },
      {
        id: "discount",
        label: "İskonto Tutarı",
        value: formatTryMoney(discount, offer.currency),
        sub: offer.subtotal ? `%${Math.round((discount / offer.subtotal) * 100)}` : "—",
        subTone: "muted",
        icon: "tag"
      },
      {
        id: "lines",
        label: "Satır Sayısı",
        value: String(offer.lines?.length ?? 0),
        sub: "Ürün / Hizmet",
        subTone: "muted",
        icon: "list"
      }
    ],
    summaryFields: [
      { label: "Teklif Numarası", value: offer.offerNo },
      { label: "Oluşturulma Tarihi", value: formatTrDateTime(offer.createdAt) },
      { label: "Geçerlilik Tarihi", value: offer.validUntil ? formatTrDateTime(offer.validUntil) : "—" },
      { label: "Para Birimi", value: offer.currency },
      { label: "Durum", value: getOfferStatusLabel(offer.status) },
      { label: "Açıklama", value: offer.note ?? "—", full: true },
      { label: "Müşteri", value: customer?.name ?? row.customerName },
      { label: "Dönüşüm", value: row.conversionLabel }
    ],
    context: {
      title: "Teklif Bağlamı",
      rows: [
        { label: "Durum", value: row.statusLabel },
        { label: "Son İletişim", value: row.latestContactLabel },
        { label: "Fiyat Grubu", value: row.priceGroupLabel },
        { label: "Müşteri", value: customer?.name ?? row.customerName },
        { label: "Notlar", value: offer.note ?? "—", full: true }
      ]
    },
    convert: TDM_CONVERT
  };
}

export const TEKLIFLER_DETAY_REFERENCE_INITIAL = cloneDemoSnapshot();

export function loadTekliflerDetayReferenceDemo(): TekliflerDetayReferenceSnapshot {
  return cloneDemoSnapshot();
}

export async function loadTekliflerDetayReferenceLive(offerId: string): Promise<TekliflerDetayReferenceSnapshot> {
  const { offers, customers } = await getOffers();
  const offer = offers.find((o) => o.id === offerId) ?? offers[0];
  if (!offer) {
    return { ...cloneDemoSnapshot(), demoBanner: REFERENCE_DEMO_BANNER };
  }
  return buildLiveSnapshot(offer, customers, null);
}
