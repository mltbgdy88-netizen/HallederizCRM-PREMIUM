// @ts-nocheck
import type { SiparisFulfillment } from "@/lib/siparis-fulfillment-links";
import { fulfillmentFromDemoRow } from "@/lib/siparis-fulfillment-links";

export type SiparisKpi = {
  id: string;
  label: string;
  value: string;
  tone: "green" | "gold" | "teal" | "blue" | "orange";
};

export type SiparisFilterOption = {
  label: string;
  value: string;
};

export type SiparisStatus =
  | "Açık"
  | "Bekleyen Onay"
  | "Teslimat Bekleyen"
  | "Kısmi Teslim"
  | "Teslim Edildi"
  | "İptal Edildi"
  | "Bekleyen Ödeme"
  | "Teklif Aşamasında";

export type SiparisTableRow = {
  id: string;
  orderNo: string;
  customer: string;
  amount: string;
  status: SiparisStatus;
  delivery: string;
};

export const SIP_DEMO_FULFILLMENT_BY_ROW: Record<string, SiparisFulfillment> = {
  "1": fulfillmentFromDemoRow({
    salesOrderId: "1",
    kind: "bolunmus",
    label: "Merkez depo + fabrika üretimi"
  }),
  "2": fulfillmentFromDemoRow({
    salesOrderId: "2",
    kind: "merkez",
    label: "Merkez depo hazırlığı"
  }),
  "3": fulfillmentFromDemoRow({
    salesOrderId: "3",
    kind: "fabrika",
    label: "Fabrika üretim emri"
  }),
  "4": fulfillmentFromDemoRow({
    salesOrderId: "4",
    kind: "bolunmus",
    label: "Kısmi teslim · bölünmüş kaynak"
  }),
  "7": fulfillmentFromDemoRow({
    salesOrderId: "7",
    kind: "fabrika",
    label: "Fabrika üretim emri"
  })
};

export type SiparisContextDetail = {
  orderId: string;
  orderNo: string;
  fulfillment: SiparisFulfillment;
  status: SiparisStatus;
  customer: string;
  contact: string;
  phone: string;
  email: string;
  deliveryDate: string;
  totalAmount: string;
  paymentMethod: string;
  lineCount: string;
  quantity: string;
  discount: string;
  subtotal: string;
  vat: string;
  grandTotal: string;
  paymentAlert: string;
  dueCount: string;
};

export const SIP_TITLE = "Siparişler Operasyon Masası";
export const SIP_SUBTITLE =
  "Siparişlerinizi yönetin, takip edin ve operasyon süreçlerinizi kontrol edin.";

export const SIP_KPIS: SiparisKpi[] = [
  { id: "open", label: "Açık Sipariş", value: "1.248", tone: "green" },
  { id: "approval", label: "Bekleyen Onay", value: "86", tone: "gold" },
  { id: "delivery", label: "Teslimat Bekleyen", value: "235", tone: "teal" },
  { id: "revenue", label: "Bu Ay Ciro", value: "₺2.485.750", tone: "blue" },
  { id: "risk", label: "Riskli Sipariş", value: "18", tone: "orange" }
];

export const SIP_FILTER_SEARCH_PLACEHOLDER = "Müşteri ara…";

export const SIP_FILTERS: { id: string; label: string; options: SiparisFilterOption[] }[] = [
  { id: "status", label: "Durum", options: [{ label: "Tümü", value: "all" }] },
  { id: "date", label: "Tarih", options: [{ label: "Tümü", value: "all" }] },
  { id: "payment", label: "Ödeme", options: [{ label: "Tümü", value: "all" }] }
];

export const SIP_TABLE_ROWS: SiparisTableRow[] = [
  {
    id: "1",
    orderNo: "SP-2025-01248",
    customer: "ABC İnşaat San. ve Tic. A.�?.",
    amount: "₺125.430,00",
    status: "Açık",
    delivery: "15.05.2025"
  },
  {
    id: "2",
    orderNo: "SP-2025-01247",
    customer: "Yılmaz Gıda Ltd. �?ti.",
    amount: "₺86.200,00",
    status: "Bekleyen Onay",
    delivery: "14.05.2025"
  },
  {
    id: "3",
    orderNo: "SP-2025-01246",
    customer: "Kaya Yapı Malzemeleri",
    amount: "₺214.750,00",
    status: "Teslimat Bekleyen",
    delivery: "16.05.2025"
  },
  {
    id: "4",
    orderNo: "SP-2025-01245",
    customer: "Demiröz Elektrik Ltd. �?ti.",
    amount: "₺42.180,00",
    status: "Kısmi Teslim",
    delivery: "12.05.2025"
  },
  {
    id: "5",
    orderNo: "SP-2025-01244",
    customer: "Akdeniz Otomotiv A.�?.",
    amount: "₺98.640,00",
    status: "Teslim Edildi",
    delivery: "09.05.2025"
  },
  {
    id: "6",
    orderNo: "SP-2025-01243",
    customer: "Mega Market Zinciri A.�?.",
    amount: "₺31.920,00",
    status: "İptal Edildi",
    delivery: "—"
  },
  {
    id: "7",
    orderNo: "SP-2025-01242",
    customer: "Sarılar Petrol Ürünleri",
    amount: "₺156.300,00",
    status: "Bekleyen Ödeme",
    delivery: "13.05.2025"
  },
  {
    id: "8",
    orderNo: "SP-2025-01241",
    customer: "Doğu Karadeniz Turizm",
    amount: "₺67.450,00",
    status: "Teklif Aşamasında",
    delivery: "—"
  }
];

export const SIP_TABLE_TOTAL = "Toplam 1.248 kayıt";
export const SIP_PAGE_NUMBERS = ["1", "2", "3", "…", "125"] as const;

export const SIP_CONTEXT_BY_ROW: Record<string, SiparisContextDetail> = {
  "1": {
    orderId: "1",
    orderNo: "SP-2025-01248",
    fulfillment: SIP_DEMO_FULFILLMENT_BY_ROW["1"]!,
    status: "Açık",
    customer: "ABC İnşaat San. ve Tic. A.�?.",
    contact: "Ahmet Yılmaz",
    phone: "(212) 555 45 67",
    email: "ahmet.yilmaz@abcinsaat.com",
    deliveryDate: "15.05.2025",
    totalAmount: "₺125.430,00",
    paymentMethod: "Vadeli (30 Gün)",
    lineCount: "15 kalem",
    quantity: "245 adet",
    discount: "%12,00",
    subtotal: "₺142.534,00",
    vat: "₺28.506,80",
    grandTotal: "₺125.430,00",
    paymentAlert: "Ödeme günü yaklaşan siparişler var.",
    dueCount: "3"
  }
};

export function getSipContext(rowId: string): SiparisContextDetail {
  const row = SIP_TABLE_ROWS.find((r) => r.id === rowId);
  const stored = SIP_CONTEXT_BY_ROW[rowId];
  const fulfillment =
    SIP_DEMO_FULFILLMENT_BY_ROW[rowId] ??
    SIP_DEMO_FULFILLMENT_BY_ROW["1"]! ??
    fulfillmentFromDemoRow({ salesOrderId: rowId, kind: "none", label: "Kaynak planı bekleniyor" });

  if (stored) {
    return { ...stored, fulfillment };
  }

  const fallback = SIP_CONTEXT_BY_ROW["1"]!;
  return {
    ...fallback,
    orderId: rowId,
    orderNo: row?.orderNo ?? fallback.orderNo,
    status: row?.status ?? fallback.status,
    fulfillment
  };
}

export function sipStatusBadgeClass(status: SiparisStatus): string {
  switch (status) {
    case "Açık":
    case "Teslim Edildi":
      return " sip-badge--open";
    case "Bekleyen Onay":
    case "Bekleyen Ödeme":
      return " sip-badge--pending";
    case "Teslimat Bekleyen":
      return " sip-badge--delivery";
    case "Kısmi Teslim":
      return " sip-badge--partial";
    case "İptal Edildi":
      return " sip-badge--cancel";
    case "Teklif Aşamasında":
      return " sip-badge--quote";
    default:
      return " sip-badge--open";
  }
}


