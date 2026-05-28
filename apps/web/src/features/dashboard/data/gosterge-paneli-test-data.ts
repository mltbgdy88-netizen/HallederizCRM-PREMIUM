/** /gosterge-paneli-test — demo veri (ASCII kaynak, \\u ka\u00e7\u0131\u015fl\u0131 metinler). */
import type { DashboardGostergeReferenceSnapshot } from "../adapters/dashboard-gosterge-reference-adapter";
import type { WopConversation } from "@/features/whatsapp/data/whatsapp-operasyon-mock";
import { DGP_ALERTS_VIEW_ALL_HREF } from "./dashboard-gosterge-paneli-mock";

export { DGP_ALERTS_VIEW_ALL_HREF };

const st = {
  onay: "Onay Bekliyor",
  bekle: "Beklemede",
  aktif: "Aktif",
  tamam: "Tamamland\u0131",
  acilTakip: "Acil takip",
  fabrika: "Fabrikaya Verilecek",
  depo: "Depoda Haz\u0131rlanacak",
  teslim: "M\u00fc\u015fteriye Teslim",
  kargo: "Kargo Bekliyor",
  onayBek: "Onay Bekleyen",
  geciken: "Geciken \u0130\u015f"
} as const;

export const GOSTERGE_PANELI_TEST_SNAPSHOT: DashboardGostergeReferenceSnapshot = {
  kpis: [
    {
      id: "factory-order",
      label: st.fabrika,
      value: "7",
      href: "/fabrikalar/siparis",
      trend: "2 sipari\u015f \u00b7 3+ g\u00fcn",
      trendTone: "warn",
      compareLabel: st.acilTakip,
      tone: "orange"
    },
    {
      id: "warehouse-prep",
      label: st.depo,
      value: "11",
      href: "/depo",
      trend: "4 i\u015f \u00b7 bug\u00fcn kapanmal\u0131",
      trendTone: "warn",
      compareLabel: st.acilTakip,
      tone: "teal"
    },
    {
      id: "customer-delivery",
      label: st.teslim,
      value: "6",
      href: "/teslimatlar",
      trend: "3 m\u00fc\u015fteri \u00b7 randevu ge\u00e7ti",
      trendTone: "warn",
      compareLabel: st.acilTakip,
      tone: "green"
    },
    {
      id: "cargo-wait",
      label: st.kargo,
      value: "4",
      href: "/teslimatlar",
      trend: "1 paket \u00b7 5. g\u00fcn",
      trendTone: "warn",
      compareLabel: st.acilTakip,
      tone: "blue"
    },
    {
      id: "approval-wait",
      label: st.onayBek,
      value: "3",
      href: "/onaylar",
      trend: "iskonto + tahsilat",
      trendTone: "neutral",
      compareLabel: st.acilTakip,
      tone: "gold"
    },
    {
      id: "overdue",
      label: st.geciken,
      value: "8",
      href: "/siparisler",
      trend: "\u00f6ncelikli liste",
      trendTone: "warn",
      compareLabel: "2+ g\u00fcn bekleyen",
      tone: "slate"
    }
  ],
  quickActions: [
    { id: "new", label: "Yeni \u00dcr\u00fcn", icon: "plus" as const },
    { id: "move", label: "Stok Hareketi", icon: "move" as const },
    { id: "transfer", label: "Transfer Talebi", icon: "transfer" as const },
    { id: "label", label: "Etiket Yazd\u0131r", icon: "label" as const },
    { id: "report", label: "Rapor Olu\u015ftur", icon: "report" as const }
  ],
  movements: [],
  alerts: [
    {
      id: "1",
      text: "Demir\u00f6z Elekt. \u00b7 SP-2412 \u00b7 fabrikaya verilmedi \u00b7 3. g\u00fcn",
      href: "/fabrikalar/siparis",
      icon: "factory"
    },
    {
      id: "2",
      text: "Kaya Yap\u0131 \u00b7 SP-2409 \u00b7 depo haz\u0131rl\u0131\u011f\u0131 yar\u0131m \u00b7 2. g\u00fcn",
      href: "/depo",
      icon: "warehouse"
    },
    {
      id: "3",
      text: "Akdeniz Oto. \u00b7 SP-2405 \u00b7 kargo \u00e7\u0131\u015f\u0131 yok \u00b7 5. g\u00fcn",
      href: "/teslimatlar",
      icon: "cargo"
    },
    {
      id: "4",
      text: "ABC \u0130n\u015faat \u00b7 SP-2401 \u00b7 ma\u011fazada teslim bekliyor \u00b7 1. g\u00fcn",
      href: "/teslimatlar",
      icon: "delivery"
    },
    {
      id: "5",
      text: "Y\u0131lmaz G\u0131da \u00b7 SP-2396 \u00b7 fabrika + depo b\u00f6l\u00fcnm\u00fc\u015f \u00b7 4. g\u00fcn",
      href: "/siparisler",
      icon: "warn"
    },
    {
      id: "6",
      text: "Mega Market \u00b7 SP-2392 \u00b7 iskonto onay\u0131 \u00b7 2. g\u00fcn",
      href: "/onaylar",
      icon: "price"
    }
  ],
  summary: [
    {
      label: "Fabrikaya verilecek",
      value: "7 sipari\u015f",
      href: "/fabrikalar/siparis",
      hint: "3 tanesi 3+ g\u00fcn bekliyor"
    },
    {
      label: "Depoda haz\u0131rlanacak",
      value: "11 sipari\u015f",
      href: "/depo",
      hint: "4 i\u015f bug\u00fcn kapanmal\u0131"
    },
    {
      label: "M\u00fc\u015fteriye teslim",
      value: "6 m\u00fc\u015fteri",
      href: "/teslimatlar",
      hint: "3 randevu saati ge\u00e7ti"
    },
    {
      label: "Kargo \u00e7\u0131k\u0131\u015f\u0131 bekleyen",
      value: "4 paket",
      href: "/teslimatlar",
      hint: "1 paket 5. g\u00fcnde"
    }
  ],
  donut: [
    { label: "Fabrika emri", pct: 25, color: "#c2410c", detail: "7 i\u015f" },
    { label: "Depo haz\u0131rl\u0131k", pct: 39, color: "#0f766e", detail: "11 i\u015f" },
    { label: "Teslimat", pct: 22, color: "#047857", detail: "6 m\u00fc\u015fteri" },
    { label: "Kargo bekliyor", pct: 14, color: "#1d4ed8", detail: "4 paket" }
  ],
  donutTotal: "28 acil i\u015f",
  aiVideoTitle: "Acil i\u015f ve geciken sipari\u015f \u00f6zeti haz\u0131r!",
  aiHighlights: [
    "Demir\u00f6z Elekt. fabrika emri 3. g\u00fcnde \u2014 \u00f6nce fabrikaya ver",
    "Akdeniz Oto. kargo 5. g\u00fcn \u2014 m\u00fc\u015fteriyi bilgilendir",
    "4 depo haz\u0131rl\u0131\u011f\u0131 bug\u00fcn kapanmal\u0131",
    "3 teslim randevusu saati ge\u00e7ti"
  ],
  aiGreeting:
    "Merhaba Yusuf Bey, bug\u00fcn 28 acil i\u015f var. Fabrika emri ve kargo bekleyenleri \u00f6nce videoda \u00f6zetledim.",
  demoBanner: null
};

export const GOSTERGE_PANELI_TEST_CONVERSATIONS: WopConversation[] = [
  {
    id: "1",
    code: "WAP-1587",
    phone: "905*******34",
    customer: "Demir Yap\u0131 A.\u015e.",
    lastMessage: "Merhaba, teklifimiz hakk\u0131nda bilgi alabilir miyim?",
    lastTime: "10:24",
    status: st.onay,
    sla: "2s 15dk",
    slaTone: "warn",
    selected: true
  },
  {
    id: "2",
    code: "WAP-1582",
    phone: "+90 533 210 44 11",
    customer: "Nova \u0130n\u015faat Ltd.",
    lastMessage: "Sevkiyat tarihini netle\u015ftirebilir misiniz?",
    lastTime: "14:08",
    status: st.bekle,
    sla: "28 dk",
    slaTone: "warn"
  },
  {
    id: "3",
    code: "WAP-1576",
    phone: "+90 542 880 12 03",
    customer: "Kuzey Mobilya",
    lastMessage: "Stok listesini WhatsApp \u00fczerinden payla\u015ft\u0131k.",
    lastTime: "13:54",
    status: st.aktif,
    sla: "1s 04dk",
    slaTone: "ok"
  },
  {
    id: "4",
    code: "WAP-1569",
    phone: "+90 536 991 77 45",
    customer: "Atlas Dekor",
    lastMessage: "\u00d6deme plan\u0131 onayland\u0131, te\u015fekk\u00fcrler.",
    lastTime: "13:31",
    status: st.tamam,
    sla: "Tamam",
    slaTone: "ok"
  },
  {
    id: "5",
    code: "WAP-1561",
    phone: "+90 505 332 19 88",
    customer: "Ege Yap\u0131 Market",
    lastMessage: "\u015eablon mesaj\u0131 m\u00fc\u015fteriye iletildi.",
    lastTime: "12:47",
    status: st.aktif,
    sla: "45 dk",
    slaTone: "ok"
  },
  {
    id: "6",
    code: "WAP-1554",
    phone: "+90 531 774 02 16",
    customer: "Vadi Seramik",
    lastMessage: "\u0130ade s\u00fcreci i\u00e7in onay bekleniyor.",
    lastTime: "12:15",
    status: st.onay,
    sla: "6 dk",
    slaTone: "danger"
  },
  {
    id: "7",
    code: "WAP-1548",
    phone: "+90 544 660 55 90",
    customer: "Merkez Toptan",
    lastMessage: "Fiyat revizyonu payla\u015f\u0131ld\u0131.",
    lastTime: "11:58",
    status: st.bekle,
    sla: "1s 22dk",
    slaTone: "warn"
  },
  {
    id: "8",
    code: "WAP-1541",
    phone: "+90 538 120 44 73",
    customer: "Park Yap\u0131 Malzeme",
    lastMessage: "Teslimat adresi g\u00fcncellendi.",
    lastTime: "11:36",
    status: st.tamam,
    sla: "Tamam",
    slaTone: "ok"
  }
];

export const GOSTERGE_PANELI_TEST_PAGINATION = {
  range: "1\u20138",
  total: "120 konu\u015fma",
  page: 1
};
