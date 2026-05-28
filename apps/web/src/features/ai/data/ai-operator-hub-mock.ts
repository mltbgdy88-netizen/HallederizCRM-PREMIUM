// @ts-nocheck
export const AOH_PAGE = {
  title: "Yapay Zeka",
  subtitle: "Sistemin ikinci beyni — önerileri inceleyin, içgörü alın, onay bekleyen planları yönetin."
};

export const AOH_KPIS = [
  {
    id: "1",
    label: "Onay Bekleyen Plan",
    value: "12",
    hint: "İnceleme Kuyruğunda",
    icon: "mail" as const
  },
  {
    id: "2",
    label: "AI Önerileri",
    value: "%98",
    hint: "Yerelde İşlenen AI Önerileri",
    icon: "ai" as const
  },
  {
    id: "3",
    label: "Bugünkü Öneri Sayısı",
    value: "256",
    hint: "Tüm Modüller",
    icon: "db" as const
  },
  {
    id: "4",
    label: "Yerel Öncelikli",
    value: "Verileriniz",
    hint: "Cihazınızda Güvende",
    icon: "shield" as const
  }
];

export const AOH_TABS = [
  { id: "pending", label: "Onay Bekleyen Planlar", count: 12, active: true },
  { id: "all", label: "Tüm Öneriler", count: 256, active: false }
];

export const AOH_SYNC = {
  local: "Yerel: Aktif",
  last: "Son senkronizasyon: Az önce"
};

export const AOH_FILTERS = ["Tüm Modüller", "Öneri Türü: Tümü", "Öncelik: Tümü", "Tarih: Tümü"];

export type AohPlanRow = {
  id: string;
  title: string;
  desc: string;
  module: string;
  priority: "Yüksek" | "Orta";
  date: string;
  time: string;
  icon: "sales" | "stock" | "crm" | "marketing" | "finance";
};

export const AOH_PLANS: AohPlanRow[] = [
  {
    id: "1",
    title: "Satış Tahmin Planı",
    desc: "Gelecek 30 gün için satış tahmini oluşturuldu.",
    module: "Satış",
    priority: "Yüksek",
    date: "18.05.2025",
    time: "09:14",
    icon: "sales"
  },
  {
    id: "2",
    title: "Stok Yenileme Planı",
    desc: "Kritik stok kalemleri için yenileme önerisi.",
    module: "Stok",
    priority: "Yüksek",
    date: "18.05.2025",
    time: "08:52",
    icon: "stock"
  },
  {
    id: "3",
    title: "Müşteri Segmentasyon Planı",
    desc: "Segment A müşterileri için kampanya önerisi.",
    module: "CRM",
    priority: "Orta",
    date: "17.05.2025",
    time: "16:40",
    icon: "crm"
  },
  {
    id: "4",
    title: "Pazarlama Kampanyası Planı",
    desc: "Yaz sezonu için çapraz satış kampanyası.",
    module: "Pazarlama",
    priority: "Orta",
    date: "17.05.2025",
    time: "14:22",
    icon: "marketing"
  },
  {
    id: "5",
    title: "Nakit Akış Planı",
    desc: "30 günlük nakit akış projeksiyonu.",
    module: "Finans",
    priority: "Yüksek",
    date: "17.05.2025",
    time: "11:05",
    icon: "finance"
  }
];

export const AOH_FOOTER = {
  security:
    "Güvenli ve Yerel Öncelikli — Tüm AI önerileri öncelikle cihazınızda işlenir. Verileriniz size aittir ve kontrol sizdedir.",
  status: "Sistem Durumu — Tüm Sistemler Çevrimiçi"
};

