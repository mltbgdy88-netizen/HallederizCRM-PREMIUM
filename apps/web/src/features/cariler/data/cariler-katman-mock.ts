// @ts-nocheck
export type CkmTabId =
  | "ozet"
  | "iletisim"
  | "finans"
  | "teklifler"
  | "siparisler"
  | "tahsilatlar"
  | "timeline";

export type CkmTabStripItem = { id: CkmTabId; label: string; href: string };

export const CKM_TABS: CkmTabStripItem[] = [
  { id: "ozet", label: "Özet", href: "/cariler/katman/ozet" },
  { id: "iletisim", label: "İletişim", href: "/cariler/katman/iletisim" },
  { id: "finans", label: "Finans", href: "/cariler/katman/finans" },
  { id: "teklifler", label: "Teklifler", href: "/cariler/katman/teklifler" },
  { id: "siparisler", label: "Siparişler", href: "/cariler/katman/siparisler" },
  { id: "tahsilatlar", label: "Tahsilatlar", href: "/cariler/katman/tahsilatlar" },
  { id: "timeline", label: "Timeline", href: "/cariler/katman/timeline" }
];

export type CkmHeaderData = {
  breadcrumb: readonly string[];
  initials: string;
  title: string;
  status: string;
  meta: readonly { label: string; value: string }[];
  contact: readonly { label: string; value: string }[];
};

export const CKM_HEADER: CkmHeaderData = {
  breadcrumb: ["Cariler", "Cari Özet Masası"],
  initials: "ABC",
  title: "ABC Duvar Kağıdı San. ve Tic. A.�?.",
  status: "Aktif",
  meta: [
    { label: "Cari Kodu", value: "ABC001" },
    { label: "Vergi No", value: "123 456 7890" },
    { label: "Cari Grubu", value: "A Bayi" },
    { label: "Yetkili", value: "Ahmet Yılmaz" }
  ],
  contact: [
    { label: "Telefon", value: "+90 212 555 10 10" },
    { label: "E-posta", value: "info@abcduvar.com" },
    { label: "Adres", value: "İkitelli OSB Mah. Aykosan Sk. No:2 Başakşehir / İstanbul" }
  ]
};

export const CKM_HEADERS: Record<CkmTabId, CkmHeaderData> = {
  ozet: CKM_HEADER,
  iletisim: {
    breadcrumb: ["Cariler", "ABC A.�?."],
    initials: "ABC",
    title: "ABC A.�?.",
    status: "Aktif",
    meta: [
      { label: "Cari Kodu", value: "C-000125" },
      { label: "Vergi No", value: "123 456 7890" },
      { label: "Yetkili", value: "Ahmet Yılmaz" },
      { label: "Grup", value: "Kurumsal" }
    ],
    contact: [
      { label: "Bakiye", value: "₺125.750,00" },
      { label: "İl / İlçe", value: "İstanbul / Kadıköy" }
    ]
  },
  finans: {
    breadcrumb: ["Cariler", "Katman: Finans", "Layer: C"],
    initials: "YG",
    title: "Yıldız Grup A.�?.",
    status: "Aktif",
    meta: [
      { label: "ID", value: "C-12590" },
      { label: "Müşteri", value: "01.01.2012'den beri müşteri" },
      { label: "Konum", value: "İstanbul, Türkiye" },
      { label: "Web", value: "www.yildizgrup.com.tr" }
    ],
    contact: [
      { label: "Cari Yetkilisi", value: "Murat Kaya (Bölge Satış Müdürü)" },
      { label: "Segment", value: "C - Orta Risk" }
    ]
  },
  teklifler: {
    breadcrumb: ["Cariler", "Katman C", "Teklifler"],
    initials: "KC",
    title: "Katman C Ltd. �?ti.",
    status: "Aktif",
    meta: [
      { label: "Cari Kodu", value: "C-000345" },
      { label: "Vergi No", value: "123 456 7890" },
      { label: "E-Posta", value: "info@katmanc.com" },
      { label: "Telefon", value: "+90 212 555 44 33" }
    ],
    contact: [{ label: "Yetkili Kişi", value: "Ahmet Yılmaz" }]
  },
  siparisler: {
    breadcrumb: ["Cariler", "Katman", "Siparişler"],
    initials: "AK",
    title: "AKSİYON DI�? TİCARET A.�?.",
    status: "Aktif",
    meta: [
      { label: "Cari Kodu", value: "C-000102" },
      { label: "Vergi No", value: "123 456 7890" },
      { label: "Cari Grubu", value: "A Grubu" },
      { label: "Yetkili", value: "Ahmet Yılmaz" }
    ],
    contact: [
      { label: "Telefon", value: "+90 212 555 10 10" },
      { label: "E-posta", value: "info@aksiyon.com.tr" }
    ]
  },
  tahsilatlar: {
    breadcrumb: ["Cariler", "Katman: C", "Tahsilatlar"],
    initials: "ÖS",
    title: "ÖRNEK SANAYİ VE TİCARET A.�?.",
    status: "Aktif",
    meta: [
      { label: "Cari No", value: "C-000125" },
      { label: "Vergi No", value: "123 456 7890" },
      { label: "Katman", value: "C" },
      { label: "Bakiye", value: "₺125.750,00" }
    ],
    contact: [
      { label: "Telefon", value: "(212) 555 10 10" },
      { label: "E-posta", value: "info@orneksanayi.com.tr" }
    ]
  },
  timeline: {
    breadcrumb: ["Cariler", "Müşteri Detayı"],
    initials: "ABC",
    title: "ABC Teknoloji A.�?.",
    status: "Aktif",
    meta: [
      { label: "Cari Kodu", value: "CAR-000123" },
      { label: "Vergi No", value: "123 456 7890" },
      { label: "Yetkili", value: "Ahmet Yılmaz (Satış Müdürü)" },
      { label: "Durum", value: "Aktif" }
    ],
    contact: [
      { label: "Telefon", value: "+90 212 555 10 10" },
      { label: "E-posta", value: "info@abcteknoloji.com" }
    ]
  }
};

export const CKM_TAB_STRIPS: Partial<Record<CkmTabId, CkmTabStripItem[]>> = {
  iletisim: [
    { id: "ozet", label: "Genel Bilgiler", href: "/cariler/katman/ozet" },
    { id: "finans", label: "Finansal Bilgiler", href: "/cariler/katman/finans" },
    { id: "teklifler", label: "İlgili Kayıtlar", href: "/cariler/katman/teklifler" },
    { id: "timeline", label: "Faaliyet Geçmişi", href: "/cariler/katman/timeline" },
    { id: "iletisim", label: "İletişim", href: "/cariler/katman/iletisim" },
    { id: "siparisler", label: "Notlar", href: "/cariler/katman/siparisler" },
    { id: "tahsilatlar", label: "Dokümanlar", href: "/cariler/katman/tahsilatlar" }
  ],
  finans: [
    { id: "ozet", label: "Özet", href: "/cariler/katman/ozet" },
    { id: "iletisim", label: "İletişim", href: "/cariler/katman/iletisim" },
    { id: "finans", label: "Finans", href: "/cariler/katman/finans" },
    { id: "teklifler", label: "Ticari", href: "/cariler/katman/teklifler" },
    { id: "siparisler", label: "Risk", href: "/cariler/katman/siparisler" },
    { id: "tahsilatlar", label: "Hareketler", href: "/cariler/katman/tahsilatlar" },
    { id: "timeline", label: "Belgeler", href: "/cariler/katman/timeline" }
  ]
};

export const CKM_CONTEXT = {
  title: "Cari Katman Bağlamı",
  cari: [
    { label: "Cari Kodu", value: "ABC001" },
    { label: "Cari Adı", value: "ABC Duvar Kağıdı San. ve Tic. A.�?." },
    { label: "Cari Grubu", value: "A Bayi" },
    { label: "Fiyat Grubu", value: "Bayi Fiyat Listesi" },
    { label: "Para Birimi", value: "TRY" },
    { label: "Durum", value: "Aktif", badge: "ok" as const }
  ],
  finans: [
    { label: "Risk Limiti", value: "₺500.000,00" },
    { label: "Kullanılan Limit", value: "₺247.350,00" },
    { label: "Kalan Limit", value: "₺252.650,00" },
    { label: "Açık Bakiye", value: "₺247.350,00", warn: true },
    { label: "Vadesi Geçmiş", value: "₺32.450,00", negative: true }
  ],
  hareketler: [
    { type: "tahsilat", title: "Tahsilat", date: "22.05.2025", amount: "₺45.000,00" },
    { type: "fatura", title: "Fatura", date: "20.05.2025", amount: "₺68.750,00" },
    { type: "siparis", title: "Sipariş", date: "18.05.2025", amount: "₺125.000,00" }
  ],
  shortcuts: [
    "Yeni Teklif Oluştur",
    "Yeni Sipariş Oluştur",
    "Tahsilat Kaydı Ekle",
    "Cari Kartını Görüntüle"
  ]
} as const;

export const OZET_KPIS = [
  {
    id: "risk",
    label: "Risk Limiti",
    value: "₺500.000,00",
    sub: "%49,47 kullanıldı",
    tone: "green" as const,
    progress: 49.47
  },
  {
    id: "balance",
    label: "Açık Bakiye",
    value: "₺247.350,00",
    sub: "Vadesi Geçmiş: ₺32.450,00",
    tone: "orange" as const,
    subWarn: true
  },
  {
    id: "purchase",
    label: "Toplam Alış",
    value: "₺1.245.800,00",
    sub: "Son Alış: 18.05.2025",
    tone: "teal" as const
  },
  {
    id: "collection",
    label: "Toplam Tahsilat",
    value: "₺997.650,00",
    sub: "Son Tahsilat: 16.05.2025",
    tone: "blue" as const
  },
  {
    id: "orders",
    label: "Açık Sipariş",
    value: "₺156.750,00",
    sub: "Sipariş Sayısı: 5",
    tone: "purple" as const
  }
] as const;

export const OZET_RECORD_TABS = [
  { id: "faturalar", label: "Açık Faturalar", count: 5, active: true },
  { id: "teklifler", label: "Teklifler", count: 3 },
  { id: "siparisler", label: "Açık Siparişler", count: 4 },
  { id: "tahsilatlar", label: "Tahsilatlar", count: 6 },
  { id: "iletisim", label: "İletişim Kayıtları", count: 8 }
] as const;

export const OZET_RECORDS = [
  {
    no: "FAT-2025-00123",
    docDate: "16.05.2025",
    dueDate: "16.06.2025",
    desc: "Duvar Kağıdı - Metalik Seri",
    amount: "₺85.750,00",
    open: "₺85.750,00",
    status: "Açık",
    tone: "ok" as const
  },
  {
    no: "FAT-2025-00118",
    docDate: "08.05.2025",
    dueDate: "07.06.2025",
    desc: "Duvar Kağıdı - İthal Seri",
    amount: "₺64.250,00",
    open: "₺64.250,00",
    status: "Açık",
    tone: "ok" as const
  },
  {
    no: "FAT-2025-00102",
    docDate: "28.04.2025",
    dueDate: "28.05.2025",
    desc: "Duvar Kağıdı - Classic Seri",
    amount: "₺45.000,00",
    open: "₺45.000,00",
    status: "Açık",
    tone: "ok" as const
  },
  {
    no: "FAT-2025-00089",
    docDate: "20.04.2025",
    dueDate: "20.05.2025",
    desc: "Duvar Kağıdı - Çocuk Odası",
    amount: "₺32.450,00",
    open: "₺32.450,00",
    status: "Vadesi Geçmiş",
    tone: "bad" as const
  },
  {
    no: "FAT-2025-00075",
    docDate: "12.04.2025",
    dueDate: "12.05.2025",
    desc: "Duvar Kağıdı - 3D Seri",
    amount: "₺19.900,00",
    open: "₺19.900,00",
    status: "Vadesi Geçmiş",
    tone: "bad" as const
  }
] as const;

export const ILETISIM_SUMMARY = [
  { label: "Telefon", value: "+90 216 555 10 10", sub: "3 Telefon" },
  { label: "E-posta", value: "info@abc.com.tr", sub: "2 E-posta" },
  { label: "Adres", value: "Acıbadem Mah. Çeçen Sk.", sub: "3 Adres" }
] as const;

export const ILETISIM_CONTACTS = [
  {
    initials: "AY",
    name: "Ahmet Yılmaz",
    role: "Genel Müdür",
    phone: "+90 532 123 45 67",
    email: "ahmet.yilmaz@abc.com.tr"
  },
  {
    initials: "MB",
    name: "Merve Bulut",
    role: "Satınalma Müdürü",
    phone: "+90 533 987 65 43",
    email: "merve.bulut@abc.com.tr"
  },
  {
    initials: "EK",
    name: "Emre Kaya",
    role: "Finans Sorumlusu",
    phone: "+90 530 456 78 90",
    email: "emre.kaya@abc.com.tr"
  },
  {
    initials: "SY",
    name: "Seda Yılmaz",
    role: "İnsan Kaynakları",
    phone: "+90 531 246 80 12",
    email: "seda.yilmaz@abc.com.tr"
  }
] as const;

export const ILETISIM_CONTEXT = {
  whatsapp: "+90 532 123 45 67",
  status: "Bağlı",
  lastMessage: "Son mesaj: 15 dakika önce",
  quickActions: [
    "Mesaj Gönder",
    "Dosya Gönder",
    "Konum Gönder",
    "Hızlı Not Gönder",
    "�?ablon Gönder"
  ],
  preferred: "WhatsApp"
} as const;

export const FINANS_KPIS = [
  { id: "open", label: "Açık Bakiye", value: "₺8.750.250,00", tone: "green" as const },
  { id: "due", label: "Vadesi Gelen", value: "₺3.245.750,00", tone: "orange" as const },
  { id: "overdue", label: "Vadesi Geçen", value: "₺2.105.500,00", tone: "bad" as const },
  { id: "limit", label: "Kredi Limiti", value: "₺15.000.000,00", tone: "blue" as const },
  { id: "used", label: "Kullanılan Limit", value: "%58", tone: "teal" as const, progress: 58 },
  { id: "risk", label: "Risk Skoru", value: "65 / 100", tone: "purple" as const }
] as const;

export const FINANS_AGING = [
  { range: "0-30 Gün", amount: "₺2.245.500,00", pct: "25,66%", count: "18", avg: "12", desc: "Vadesi yaklaşan bakiyeler", tone: "ok" as const },
  { range: "31-60 Gün", amount: "₺1.780.250,00", pct: "20,34%", count: "14", avg: "45", desc: "İzlenmesi gereken bakiyeler", tone: "warn" as const },
  { range: "61-90 Gün", amount: "₺1.560.000,00", pct: "17,83%", count: "11", avg: "72", desc: "Tahsilat aksayan bakiyeler", tone: "orange" as const },
  { range: "91-120 Gün", amount: "₺1.015.000,00", pct: "11,60%", count: "8", avg: "102", desc: "Yakın takibe alınmalı", tone: "bad" as const },
  { range: "120+ Gün", amount: "₺2.105.500,00", pct: "24,02%", count: "12", avg: "158", desc: "Yasal takip riski yüksek", tone: "bad" as const }
] as const;

export const FINANS_AGING_TOTAL = {
  amount: "₺8.750.250,00",
  pct: "100%",
  count: "63",
  avg: "78"
} as const;

export const FINANS_CONTEXT = {
  title: "Finans Bağlamı",
  suggestion: {
    amount: "₺3.245.750,00",
    strategy: "Telefon + E-posta + Ziyaret",
    plan: "₺2.000.000,00 — 3 taksit önerisi"
  },
  kpis: [
    { label: "Açık Bakiye", value: "₺8.750.250" },
    { label: "Vadesi Gelen", value: "₺3.245.750" },
    { label: "Ortalama Vade (Gün)", value: "78" },
    { label: "Tahsilat Performansı", value: "%72 ↑" }
  ],
  cta: "Tahsilat Planı Oluştur",
  updated: "20.05.2024 09:45"
} as const;

export const SIPARISLER_ROWS = [
  { no: "SIP-2024-000156", amount: "₺125.000,00", status: "Onaylandı", delivery: "24.05.2024", tone: "ok" as const },
  { no: "SIP-2024-000148", amount: "₺86.750,00", status: "Teslim Edildi", delivery: "18.05.2024", tone: "ok" as const },
  { no: "SIP-2024-000142", amount: "₺42.300,00", status: "Hazırlanıyor", delivery: "28.05.2024", tone: "info" as const },
  { no: "SIP-2024-000135", amount: "₺68.500,00", status: "Kargoya Verildi", delivery: "22.05.2024", tone: "blue" as const },
  { no: "SIP-2024-000128", amount: "₺15.200,00", status: "İptal Edildi", delivery: "—", tone: "bad" as const }
] as const;

export const SIPARISLER_CONTEXT = {
  title: "Sipariş Bağlamı",
  no: "SIP-2024-000156",
  status: "Onaylandı",
  fields: [
    { label: "Sipariş Tarihi", value: "20.05.2024 14:35" },
    { label: "Teslim Tarihi", value: "24.05.2024" },
    { label: "Tutar", value: "₺125.000,00" },
    { label: "Para Birimi", value: "TRY" },
    { label: "Oluşturan", value: "Yönetici" },
    { label: "Onaylayan", value: "Ahmet Yılmaz" },
    { label: "Açıklama", value: "—" }
  ],
  delivery: [
    { label: "Teslimat Adresi", value: "İkitelli OSB Mah. Metal İş San. Sitesi 5. Blok No:23 Başakşehir / İstanbul" },
    { label: "Teslim Alan", value: "Mehmet Kaya" },
    { label: "Kargo Firması", value: "Sürat Kargo" },
    { label: "Kargo Takip No", value: "12345678901234" }
  ],
  totalRecords: 156
} as const;

export const TAHSILATLAR_ROWS = [
  { no: "THS-2025-000145", amount: "₺25.000,00", method: "Havale", status: "Tamamlandı", tone: "ok" as const },
  { no: "THS-2025-000142", amount: "₺15.750,00", method: "Kredi Kartı", status: "Tamamlandı", tone: "ok" as const },
  { no: "THS-2025-000138", amount: "₺8.500,00", method: "Nakit", status: "Tamamlandı", tone: "ok" as const },
  { no: "THS-2025-000121", amount: "₺12.000,00", method: "Havale", status: "Beklemede", tone: "warn" as const },
  { no: "THS-2025-000097", amount: "₺20.000,00", method: "Kredi Kartı", status: "Tamamlandı", tone: "ok" as const },
  { no: "THS-2025-000076", amount: "₺18.750,00", method: "Çek", status: "İptal Edildi", tone: "bad" as const },
  { no: "THS-2025-000054", amount: "₺25.000,00", method: "Nakit", status: "Tamamlandı", tone: "ok" as const }
] as const;

export const TAHSILATLAR_CONTEXT = {
  title: "Tahsilat Bağlamı",
  summary: [
    { label: "Toplam Tahsilat", value: "₺125.000,00", tone: "ok" as const },
    { label: "Bekleyen Tahsilat", value: "₺12.000,00", tone: "warn" as const },
    { label: "İptal Edilen Tahsilat", value: "₺18.750,00", tone: "bad" as const }
  ],
  dates: [
    { label: "Son Tahsilat", value: "23.05.2025 14:35" },
    { label: "Sonraki Tahsilat Beklentisi", value: "28.05.2025" },
    { label: "Ortalama Tahsilat Süresi", value: "18 Gün" }
  ],
  actions: ["Tahsilat Ekle", "Ödeme Planı Oluştur", "Hatırlatma Gönder", "Tahsilat Raporu"]
} as const;

export const TEKLIFLER_ROWS = [
  { no: "TKL-2025-00189", amount: "₺125.750,00", status: "Gönderildi", date: "24.05.2025", tone: "info" as const },
  { no: "TKL-2025-00172", amount: "₺86.500,00", status: "Teklif Hazırlanıyor", date: "20.05.2025", tone: "neutral" as const },
  { no: "TKL-2025-00158", amount: "₺245.000,00", status: "Kabul Edildi", date: "15.05.2025", tone: "ok" as const },
  { no: "TKL-2025-00142", amount: "₺68.750,00", status: "Reddedildi", date: "08.05.2025", tone: "bad" as const },
  { no: "TKL-2025-00125", amount: "₺125.400,00", status: "Gönderildi", date: "02.05.2025", tone: "info" as const }
] as const;

export const TEKLIFLER_FILTER = {
  title: "Teklif Bağlamı",
  statuses: [
    { label: "Gönderildi", count: 6 },
    { label: "Teklif Hazırlanıyor", count: 3 },
    { label: "Kabul Edildi", count: 5 },
    { label: "Reddedildi", count: 4 }
  ],
  total: 18
} as const;

export const TIMELINE_FILTERS = {
  types: [
    { label: "Not", tone: "green" as const },
    { label: "Arama", tone: "blue" as const },
    { label: "E-posta", tone: "purple" as const },
    { label: "Toplantı", tone: "teal" as const },
    { label: "Görev", tone: "orange" as const },
    { label: "Teklif", tone: "info" as const },
    { label: "Sözleşme", tone: "neutral" as const },
    { label: "Ödeme", tone: "ok" as const },
    { label: "Diğer", tone: "warn" as const }
  ],
  range: "Son 90 gün",
  start: "01.03.2025",
  end: "30.05.2025"
} as const;

export const TIMELINE_EVENTS = [
  {
    id: "1",
    group: "Bugün",
    title: "Not Eklendi",
    desc: "Müşteri ile yapılan görüşme notu eklendi.",
    user: "Yusuf Kaya",
    time: "30.05.2025 14:30",
    type: "Not",
    tone: "green" as const
  },
  {
    id: "2",
    group: "Bugün",
    title: "Arama Yapıldı",
    desc: "Müşteri ile telefon görüşmesi gerçekleştirildi.",
    user: "Zeynep Demir",
    time: "28.05.2025 11:15",
    type: "Arama",
    tone: "blue" as const
  },
  {
    id: "3",
    group: "Bugün",
    title: "E-posta Gönderildi",
    desc: "Teklif detayları müşteriye e-posta ile iletildi.",
    user: "Yusuf Kaya",
    time: "27.05.2025 16:45",
    type: "E-posta",
    tone: "purple" as const
  },
  {
    id: "4",
    group: "Bugün",
    title: "Toplantı Gerçekleştirildi",
    desc: "Yıllık değerlendirme toplantısı yapıldı.",
    user: "Ahmet Yılmaz",
    time: "24.05.2025 10:00",
    type: "Toplantı",
    tone: "orange" as const
  },
  {
    id: "5",
    group: "Bugün",
    title: "Görev Tamamlandı",
    desc: "Teklif hazırlama görevi tamamlandı.",
    user: "Yusuf Kaya",
    time: "22.05.2025 09:30",
    type: "Görev",
    tone: "warn" as const
  },
  {
    id: "6",
    group: "Geçen Hafta",
    title: "Teklif Oluşturuldu",
    desc: "TEK-2025-00124 numaralı teklif oluşturuldu.",
    user: "Zeynep Demir",
    time: "20.05.2025 13:20",
    type: "Teklif",
    tone: "info" as const
  }
] as const;

export const TIMELINE_CONTEXT = {
  title: "Timeline Bağlamı",
  related: [
    { label: "Müşteri", value: "ABC Teknoloji A.�?." },
    { label: "Yetkili Kişi", value: "Ahmet Yılmaz" }
  ],
  opportunities: [
    { title: "CRM Yazılım Lisansı", amount: "₺125.000,00" },
    { title: "ERP Entegrasyon Projesi", amount: "₺250.000,00" }
  ],
  offers: [
    { no: "TEK-2025-00124", status: "Teklif Verildi", amount: "₺125.000,00" },
    { no: "TEK-2025-00118", status: "Teklif Verildi", amount: "₺86.500,00" },
    { no: "TEK-2025-00105", status: "Kabul Edildi", amount: "₺245.000,00" }
  ],
  contracts: [{ no: "SOZ-2025-00045", status: "Yürürlükte", amount: "₺125.000,00" }],
  payments: [
    { date: "22.05.2025", amount: "₺62.500,00", status: "Ödendi" },
    { date: "15.05.2025", amount: "₺62.500,00", status: "Ödendi" }
  ]
} as const;

