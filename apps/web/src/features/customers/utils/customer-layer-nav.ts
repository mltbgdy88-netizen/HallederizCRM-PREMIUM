import type { CustomerLayerKey } from "../../ui-inventory/utils/cariler-subroute-command-center-data";

const CUSTOMER_LAYER_SUFFIX: Record<CustomerLayerKey, string> = {
  ozet: "/ozet",
  iletisim: "/iletisim",
  finans: "/finans",
  teklifler: "/teklifler",
  siparisler: "/siparisler",
  tahsilatlar: "/tahsilatlar",
  timeline: "/timeline"
};

export const CUSTOMER_DETAIL_ROOT_LABEL = "Detay";

export type CustomerLayerNavItemDef = {
  id: CustomerLayerKey;
  label: string;
};

/** Kanonik katman sekmeleri — kök detay hariç, ürün sırası sabit. */
export const CUSTOMER_LAYER_NAV_ITEMS: CustomerLayerNavItemDef[] = [
  { id: "ozet", label: "Özet" },
  { id: "iletisim", label: "İletişim" },
  { id: "finans", label: "Finans" },
  { id: "teklifler", label: "Teklifler" },
  { id: "siparisler", label: "Siparişler" },
  { id: "tahsilatlar", label: "Tahsilatlar" },
  { id: "timeline", label: "Zaman Akışı" }
];

export type CustomerLayerNavItem = {
  id: CustomerLayerKey;
  label: string;
  href: string;
};

export function customerLayerHref(customerId: string, layer?: CustomerLayerKey): string {
  const base = `/cariler/${customerId}`;
  if (!layer) return base;
  return `${base}${CUSTOMER_LAYER_SUFFIX[layer]}`;
}

export function buildCustomerLayerNavItems(customerId: string): CustomerLayerNavItem[] {
  return CUSTOMER_LAYER_NAV_ITEMS.map((tab) => ({
    id: tab.id,
    label: tab.label,
    href: customerLayerHref(customerId, tab.id)
  }));
}

/** Kök detay ve katman sekmeleri — aynı kanonik kaynak. */
export function buildCustomerDetailTabs(customerId: string): CustomerLayerNavItem[] {
  return buildCustomerLayerNavItems(customerId);
}
