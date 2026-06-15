import {
  CUSTOMER_DETAIL_ROOT_LABEL,
  CUSTOMER_LAYER_NAV_ITEMS,
  customerLayerHref
} from "../../customers/utils/customer-layer-nav";
import type { CustomerLayerKey } from "./cariler-subroute-command-center-data";
import type { OrderLayerKey } from "./siparisler-subroute-command-center-data";
import type { OfferLayerKey } from "./teklifler-subroute-command-center-data";

export type EntityLayerNavItem = {
  href: string;
  label: string;
};

const ORDER_LAYER_SUFFIX: Record<OrderLayerKey, string> = {
  ozet: "/ozet",
  satirlar: "/satirlar",
  "odeme-tahsilat": "/odeme-tahsilat",
  teslimat: "/teslimat",
  fatura: "/fatura",
  iade: "/iade",
  "depo-stok-etkisi": "/depo-stok-etkisi",
  timeline: "/timeline"
};

const OFFER_LAYER_SUFFIX: Record<OfferLayerKey, string> = {
  ozet: "/ozet",
  satirlar: "/satirlar",
  musteri: "/musteri",
  "siparise-donusturme": "/siparise-donusturme",
  belgeler: "/belgeler",
  timeline: "/timeline"
};

export function customerEntityHref(customerId: string, layer?: CustomerLayerKey): string {
  return customerLayerHref(customerId, layer);
}

export function orderEntityHref(orderId: string, layer?: OrderLayerKey): string {
  const base = `/siparisler/${orderId}`;
  if (!layer) return base;
  return `${base}${ORDER_LAYER_SUFFIX[layer]}`;
}

export function offerEntityHref(offerId: string, layer?: OfferLayerKey): string {
  const base = `/teklifler/${offerId}`;
  if (!layer) return base;
  return `${base}${OFFER_LAYER_SUFFIX[layer]}`;
}

export function buildCustomerEntityNav(customerId: string): EntityLayerNavItem[] {
  return [
    { href: customerEntityHref(customerId), label: CUSTOMER_DETAIL_ROOT_LABEL },
    ...CUSTOMER_LAYER_NAV_ITEMS.map((tab) => ({
      href: customerEntityHref(customerId, tab.id),
      label: tab.label
    }))
  ];
}

export function buildOrderEntityNav(orderId: string): EntityLayerNavItem[] {
  return [
    { href: orderEntityHref(orderId), label: "Detay" },
    { href: orderEntityHref(orderId, "ozet"), label: "Özet" },
    { href: orderEntityHref(orderId, "satirlar"), label: "Satırlar" },
    { href: orderEntityHref(orderId, "odeme-tahsilat"), label: "Ödeme" },
    { href: orderEntityHref(orderId, "teslimat"), label: "Teslimat" },
    { href: orderEntityHref(orderId, "fatura"), label: "Fatura" },
    { href: orderEntityHref(orderId, "iade"), label: "İade" },
    { href: orderEntityHref(orderId, "depo-stok-etkisi"), label: "Depo" },
    { href: orderEntityHref(orderId, "timeline"), label: "Zaman çizelgesi" }
  ];
}

export function buildOfferEntityNav(offerId: string): EntityLayerNavItem[] {
  return [
    { href: offerEntityHref(offerId), label: "Detay" },
    { href: offerEntityHref(offerId, "ozet"), label: "Özet" },
    { href: offerEntityHref(offerId, "satirlar"), label: "Satırlar" },
    { href: offerEntityHref(offerId, "musteri"), label: "Müşteri" },
    { href: offerEntityHref(offerId, "siparise-donusturme"), label: "Siparişe dönüşüm" },
    { href: offerEntityHref(offerId, "belgeler"), label: "Belgeler" },
    { href: offerEntityHref(offerId, "timeline"), label: "Zaman çizelgesi" }
  ];
}

/** En uzun eşleşen href — kök detay ile alt katman ayrımı */
export function resolveActiveEntityNav(pathname: string, items: EntityLayerNavItem[]): string {
  const normalized = pathname.replace(/\/$/, "") || "/";
  let best = items[0]?.href ?? "/";
  let bestLen = 0;
  for (const item of items) {
    const href = item.href.replace(/\/$/, "") || "/";
    if (normalized === href || normalized.startsWith(`${href}/`)) {
      if (href.length >= bestLen) {
        bestLen = href.length;
        best = item.href;
      }
    }
  }
  return best;
}
