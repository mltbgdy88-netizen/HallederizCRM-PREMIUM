import type { Customer, Offer, OfferFollowUp } from "@hallederiz/types";
import { dateLabel, formatTryMoney } from "../../orders/utils/format";
import { getOfferStatusLabel } from "../queries/offer-mock-data";

export type OfferReferenceLayerKey =
  | "ozet"
  | "satirlar"
  | "musteri"
  | "siparise-donusturme"
  | "belgeler"
  | "timeline";

export type OfferReferenceKpi = {
  label: string;
  value: string;
  hint: string;
  tone?: "success" | "warning" | "info" | "gold";
};

export type OfferTimelineEvent = {
  id: string;
  title: string;
  date: string;
};

export type OfferReferenceModel = {
  headerMeta: string;
  kpis: OfferReferenceKpi[];
  conversionStatusLabel: string;
  documentStatusLabel: string;
  timelineEvents: OfferTimelineEvent[];
};

export const OFFER_LAYER_TITLES: Record<OfferReferenceLayerKey, string> = {
  ozet: "Teklif Özeti",
  satirlar: "Teklif Satırları",
  musteri: "Müşteri",
  "siparise-donusturme": "Siparişe Dönüştürme",
  belgeler: "Belgeler",
  timeline: "Zaman Akışı"
};

export const OFFER_PREFILL_NOTE =
  "Teklif parametresi Hızlı İşlem'e taşınır; otomatik satır yükleme sonraki fazda bağlanacak.";

function documentStatusLabel(offer: Offer): string {
  if (offer.documentStatus === "sent") {
    return "Gönderildi";
  }
  if (offer.documentStatus === "previewed") {
    return "Önizlendi";
  }
  if (offer.documentStatus === "not_created") {
    return "Oluşturulmadı";
  }
  return "—";
}

function conversionStatusLabel(offer: Offer): string {
  if (offer.status === "converted") {
    return "Siparişe dönüştürüldü";
  }
  if (offer.convertedOrderDraftId) {
    return "Taslak hazır";
  }
  return "Bekliyor";
}

function conversionTone(offer: Offer): OfferReferenceKpi["tone"] {
  if (offer.status === "converted") {
    return "success";
  }
  if (offer.convertedOrderDraftId) {
    return "info";
  }
  return "gold";
}

export function buildOfferTimelineEvents(offer: Offer): OfferTimelineEvent[] {
  const events: OfferTimelineEvent[] = [
    { id: "created", title: "Teklif oluşturuldu", date: offer.createdAt }
  ];

  if (offer.sentAt) {
    events.push({ id: "sent", title: "Teklif gönderildi", date: offer.sentAt });
  }

  if (offer.updatedAt && offer.updatedAt !== offer.createdAt) {
    events.push({ id: "updated", title: "Teklif güncellendi", date: offer.updatedAt });
  }

  for (const followUp of offer.followUps) {
    events.push({
      id: `followup-${followUp.id}`,
      title: `Follow-up: ${followUp.note || followUp.responseState}`,
      date: followUp.completedAt ?? followUp.plannedAt
    });
  }

  if (offer.status === "converted") {
    events.push({
      id: "converted",
      title: "Siparişe dönüştürüldü",
      date: offer.updatedAt
    });
  }

  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function buildOfferReferenceModel(offer: Offer, customer: Customer | null): OfferReferenceModel {
  const customerName = customer?.name ?? offer.customerId;
  const headerMeta = `${offer.offerNo} · ${customerName} · ${dateLabel(offer.createdAt)}`;

  const kpis: OfferReferenceKpi[] = [
    {
      label: "Teklif tutarı",
      value: formatTryMoney(offer.grandTotal, offer.currency),
      hint: offer.offerNo,
      tone: "success"
    },
    {
      label: "Durum",
      value: getOfferStatusLabel(offer.status),
      hint: offer.sentAt ? dateLabel(offer.sentAt) : "—",
      tone: offer.status === "approved" || offer.status === "converted" ? "success" : undefined
    },
    {
      label: "Geçerlilik",
      value: dateLabel(offer.validUntil),
      hint: offer.status === "expired" ? "Süresi doldu" : "Aktif",
      tone: offer.status === "expired" ? "warning" : undefined
    },
    {
      label: "Satır sayısı",
      value: String(offer.lines.length),
      hint: offer.priceSlotLabelSnapshot || "—"
    },
    {
      label: "Dönüşüm",
      value: conversionStatusLabel(offer),
      hint: offer.convertedOrderDraftId ?? "—",
      tone: conversionTone(offer)
    },
    {
      label: "İskonto",
      value: formatTryMoney(offer.discountTotal, offer.currency),
      hint: `KDV %${offer.taxRate}`,
      tone: offer.discountTotal > 0 ? "gold" : undefined
    }
  ];

  return {
    headerMeta,
    kpis,
    conversionStatusLabel: conversionStatusLabel(offer),
    documentStatusLabel: documentStatusLabel(offer),
    timelineEvents: buildOfferTimelineEvents(offer)
  };
}

export function buildQuickOrderFromOfferHref(offerId: string, customerId?: string): string {
  const params = new URLSearchParams({ tab: "order", offer: offerId });
  if (customerId) {
    params.set("customer", customerId);
  }
  return `/hizli-islem/satis-masasi?${params.toString()}`;
}

export function buildQuickOfferHref(customerId?: string): string {
  const params = new URLSearchParams({ tab: "offer" });
  if (customerId) {
    params.set("customer", customerId);
  }
  return `/hizli-islem/satis-masasi?${params.toString()}`;
}

export function offerInfoFields(offer: Offer, customer: Customer | null) {
  return [
    { label: "Teklif no", value: offer.offerNo },
    { label: "Cari", value: customer?.name ?? offer.customerId },
    { label: "Oluşturma", value: dateLabel(offer.createdAt) },
    { label: "Geçerlilik", value: dateLabel(offer.validUntil) },
    { label: "Durum", value: getOfferStatusLabel(offer.status) },
    { label: "Para birimi", value: offer.currency },
    { label: "Fiyat grubu", value: customer?.pricingProfile.priceSlotLabelSnapshot ?? offer.priceSlotLabelSnapshot },
    { label: "Oluşturan", value: offer.createdBy },
    { label: "Gönderim", value: offer.sentAt ? dateLabel(offer.sentAt) : "—" },
    { label: "Not", value: offer.note ?? "—", full: true }
  ];
}

export function offerTotalsFields(offer: Offer) {
  return [
    { label: "Ara toplam", value: formatTryMoney(offer.subtotal, offer.currency) },
    { label: "İskonto", value: formatTryMoney(offer.discountTotal, offer.currency) },
    { label: `KDV %${offer.taxRate}`, value: formatTryMoney(offer.taxTotal, offer.currency) },
    { label: "Genel toplam", value: formatTryMoney(offer.grandTotal, offer.currency) }
  ];
}

export { getOfferStatusLabel };
