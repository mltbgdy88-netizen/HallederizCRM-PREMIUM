// @ts-nocheck
export type SkmTabId =
  | "ozet"
  | "satirlar"
  | "odeme"
  | "teslimat"
  | "fatura"
  | "iade"
  | "depo"
  | "timeline";

export const SKM_TABS: { id: SkmTabId; label: string; href: string }[] = [
  { id: "ozet", label: "Özet", href: "/siparisler/katman/ozet" },
  { id: "satirlar", label: "Satırlar", href: "/siparisler/katman/satirlar" },
  { id: "odeme", label: "Ödeme", href: "/siparisler/katman/odeme" },
  { id: "teslimat", label: "Teslimat", href: "/siparisler/katman/teslimat" },
  { id: "fatura", label: "Fatura", href: "/siparisler/katman/fatura" },
  { id: "iade", label: "İade", href: "/siparisler/katman/iade" },
  { id: "depo", label: "Depo", href: "/siparisler/katman/depo-stok" },
  { id: "timeline", label: "Timeline", href: "/siparisler/katman/timeline" }
];

export const SKM_HEADER = {
  orderId: "SP-24031",
  orderDate: "23.05.2025 14:35",
  status: "Onaylandı",
  customer: "ABC Makina Sanayi A.Ş.",
  customerBadge: "Kurumsal",
  customerCode: "MUS-00015",
  email: "info@abcmakina.com",
  phone: "+90 212 555 01 23",
  rep: "Yusuf Kaya",
  repRole: "Satış Yöneticisi",
  priceList: "Standart Fiyat Listesi",
  priceListCode: "FYS-00001",
  currency: "TRY Türk Lirası"
} as const;

export const SKM_FIN_KPIS = [
  { id: "order", label: "Sipariş Tutarı", value: "₺125.430,00", sub: "5 satır", tone: "green" as const },
  { id: "delivery", label: "Teslimat Tutarı", value: "₺86.750,00", sub: "3 irsaliye", tone: "teal" as const },
  { id: "collection", label: "Tahsilat Tutarı", value: "₺86.750,00", sub: "2 tahsilat", tone: "blue" as const },
  { id: "remaining", label: "Kalan Tutar", value: "₺38.680,00", sub: "%30,87", tone: "orange" as const }
] as const;

export const SKM_OZET_INFO = [
  { label: "Sipariş No", value: "SP-24031" },
  { label: "Sipariş Tarihi", value: "23.05.2025 14:35" },
  { label: "Talep Tarihi", value: "23.05.2025" },
  { label: "Geçerlilik Tarihi", value: "22.06.2025" },
  { label: "Sipariş Tipi", value: "Standart Sipariş" },
  { label: "Satış Kanalı", value: "Doğrudan Satış" },
  { label: "Açıklama", value: "Proje bazlı ekipman tedariki.", full: true }
] as const;

export const SKM_STATUS_STEPS = [
  { label: "Taslak", done: true },
  { label: "Onaylandı", done: true, active: true },
  { label: "Kısmi Teslimat", done: false },
  { label: "Teslim Edildi", done: false },
  { label: "Tamamlandı", done: false }
] as const;

export const SKM_EXTRA_INFO = [
  { label: "Proje Kodu", value: "PJR-00045" },
  { label: "Proje Adı", value: "XYZ Üretim Hattı" },
  { label: "Departman", value: "Satış" },
  { label: "Ödeme Koşulu", value: "30 Gün" },
  { label: "Teslimat Koşulu", value: "CPT" },
  { label: "Oluşturan", value: "Yusuf Kaya" },
  { label: "Oluşturma Tarihi", value: "23.05.2025 14:35" },
  { label: "Son Güncelleme", value: "24.05.2025 09:12" }
] as const;

export const SKM_CONTEXT = {
  title: "Sipariş Katman Bağlamı",
  customerStatus: "Güvenilir",
  limit: "₺500.000,00",
  remainingLimit: "₺214.350,00",
  overdue: "₺15.250,00",
  stats: [
    { label: "Toplam satır", value: "5" },
    { label: "Toplam miktar", value: "18" },
    { label: "Toplam tutar", value: "₺125.430,00" },
    { label: "Teslim edilen", value: "₺86.750,00" },
    { label: "Tahsil edilen", value: "₺86.750,00" },
    { label: "Kalan", value: "₺38.680,00", warn: true },
    { label: "İptal", value: "₺0,00" }
  ],
  actions: [
    "İrsaliye Oluştur",
    "Fatura Oluştur",
    "Tahsilat Kaydet",
    "İade Oluştur",
    "Yazdır ▾"
  ],
  note: "Müşteri proje bazlı çalışıyor. Teslimat süresine dikkat edilmeli.",
  noteAuthor: "Yusuf Kaya"
} as const;

export const SKM_SATIRLAR_HEADER = {
  back: "← Siparişlere Dön",
  title: "Sipariş Yönetimi",
  orderNo: "SIP-2025-000246",
  customer: "ABC Makina San. Ltd. Şti.",
  orderDate: "22.05.2025",
  deliveryDate: "29.05.2025",
  status: "Onaylandı",
  currency: "TRY",
  description: "Fabrika bakım ve üretim hattı ekipmanları siparişi.",
  createdBy: "Yusuf Kaya",
  createdAt: "22.05.2025 10:15",
  updatedBy: "Yusuf Kaya",
  updatedAt: "22.05.2025 14:32"
} as const;

export const SKM_SATIRLAR_ROWS = [
  { product: "UR-10001 Rulman 6205 2RS", qty: "10,00", unit: "Adet", price: "₺85,00", discPct: "5", discAmt: "₺42,50", total: "₺807,50" },
  { product: "UR-10002 V Kayış SPB 1600", qty: "5,00", unit: "Adet", price: "₺120,00", discPct: "0", discAmt: "₺0,00", total: "₺600,00" },
  { product: "UR-10003 Elektrik Motoru 7.5 kW", qty: "2,00", unit: "Adet", price: "₺8.750,00", discPct: "3", discAmt: "₺525,00", total: "₺16.975,00" },
  { product: "UR-10004 Hava Filtresi AF-261", qty: "4,00", unit: "Adet", price: "₺210,00", discPct: "0", discAmt: "₺0,00", total: "₺840,00" },
  { product: "UR-10005 Hidrolik Yağ 46 20L", qty: "8,00", unit: "Teneke", price: "₺1.350,00", discPct: "2", discAmt: "₺216,00", total: "₺10.584,00" },
  { product: "UR-10007 Küresel Vana DN25", qty: "3,00", unit: "Adet", price: "₺680,00", discPct: "0", discAmt: "₺0,00", total: "₺2.040,00" }
] as const;

export const SKM_SATIRLAR_TOTALS = [
  { label: "Ara Toplam", value: "₺31.846,50" },
  { label: "Toplam İskonto", value: "₺783,50" },
  { label: "KDV (%20)", value: "₺6.212,60" },
  { label: "Genel Toplam", value: "₺37.275,60", strong: true }
] as const;

export const SKM_LINE_CONTEXT = {
  title: "Satır Bağlamı",
  code: "UR-10001",
  name: "Rulman 6205 2RS",
  status: "Stokta",
  stockCode: "8681234567890",
  brand: "SKF",
  category: "Rulmanlar",
  unit: "Adet",
  stock: [
    { label: "Merkez Stok", value: "2.450 adet" },
    { label: "Fabrika Stok", value: "1.250 adet" },
    { label: "Depo Raf", value: "850 adet" },
    { label: "Rezerve", value: "100 adet" },
    { label: "Bekleyen Giriş", value: "300 adet" },
    { label: "Bekleyen Çıkış", value: "150 adet" }
  ],
  shelf: {
    warehouse: "Merkez Depo",
    code: "A-01-01",
    type: "Palet Raf",
    capacity: "68%",
    capacityLabel: "1.250 / 1.860 adet"
  },
  actions: ["Stok Hareketini Görüntüle", "Ürün Kartını Aç", "Etiket Yazdır"]
} as const;

export const SKM_DEPO_KPIS = [
  { id: "total", label: "Toplam Sipariş", value: "125", tone: "green" as const },
  { id: "pending", label: "Onay Bekleyen", value: "28", tone: "gold" as const },
  { id: "partial", label: "Kısmi Sevkiyat", value: "65", tone: "teal" as const },
  { id: "ready", label: "Sevkiyata Hazır", value: "20", tone: "green" as const },
  { id: "done", label: "Tamamlanan", value: "10", tone: "green" as const },
  { id: "cancel", label: "İptal", value: "2", tone: "orange" as const }
] as const;

export const SKM_DEPO_ALERT =
  "Bu bölüm siparişin depo stoklarına etkisini gösterir. Rezervasyon ve çekim hareketleri burada izlenir.";

export const SKM_DEPO_ROWS = [
  { code: "UR-10001", name: "Rulman 6205 2RS", reserve: "1250", withdraw: "850", missing: "0", ok: true },
  { code: "UR-10002", name: "V Kayış SPB 1600", reserve: "800", withdraw: "400", missing: "0", ok: true },
  { code: "UR-10003", name: "Elektrik Motoru 7.5 kW", reserve: "300", withdraw: "120", missing: "0", ok: true },
  { code: "UR-10006", name: "Dişli Çark Z-24", reserve: "60", withdraw: "30", missing: "0", ok: true },
  { code: "UR-10005", name: "Hidrolik Yağ 46 20L", reserve: "450", withdraw: "200", missing: "0", ok: true },
  { code: "UR-10007", name: "Küresel Vana DN25", reserve: "150", withdraw: "90", missing: "0", ok: true },
  { code: "UR-10004", name: "Hava Filtresi AF-261", reserve: "100", withdraw: "80", missing: "20", ok: false }
] as const;

export const SKM_DEPO_CONTEXT = {
  title: "Depo Bağlamı",
  warehouse: "MERKEZ DEPO",
  badge: "Ana Depo",
  status: "Aktif",
  code: "D-01",
  location: "A-01-01",
  responsible: "Mehmet Yılmaz",
  capacity: "1.250 / 1.860",
  capacityPct: "68%",
  updated: "09.05.2025 14:35",
  warnings: [
    { label: "Raf Stok Seviyesi Düşük", shelf: "A-01-01", tone: "warn" as const },
    { label: "Raf Stok Seviyesi Kritik", shelf: "B-02-01", tone: "bad" as const },
    { label: "Raf Stok Seviyesi Kritik", shelf: "C-01-03", tone: "bad" as const }
  ],
  actions: ["Stok Hareketi Oluştur", "Transfer Talebi Oluştur", "Rezervasyon Oluştur", "Depo Raporu"]
} as const;

export const SKM_FATURA_HEADER = {
  breadcrumb: ["Siparişler", "Sipariş Detayı"],
  orderId: "SO-2025-000246",
  status: "Onaylandı",
  created: "Oluşturulma: 15.05.2025 14:30",
  customer: "Müşteri: ABC Makina San. ve Tic. A.Ş."
} as const;

export const SKM_FATURA_KPIS = [
  { label: "Toplam Fatura", value: "3 Adet" },
  { label: "Toplam Tutar", value: "₺68.750,00", sub: "KDV Dahil" },
  { label: "Ödenen Tutar", value: "₺43.750,00", sub: "KDV Dahil" },
  { label: "Kalan Tutar", value: "₺25.000,00", sub: "KDV Dahil", warn: true }
] as const;

export const SKM_FATURA_ROWS = [
  {
    no: "INV-2025-000178",
    date: "16.05.2025",
    due: "30.05.2025",
    amount: "₺25.000,00",
    payStatus: "Ödendi",
    payTone: "ok" as const,
    eStatus: "E-Fatura Gönderildi",
    eTone: "ok" as const
  },
  {
    no: "INV-2025-000215",
    date: "24.05.2025",
    due: "07.06.2025",
    amount: "₺18.750,00",
    payStatus: "Kısmi Ödeme",
    payTone: "warn" as const,
    eStatus: "E-Fatura Gönderildi",
    eTone: "ok" as const
  },
  {
    no: "INV-2025-000246",
    date: "31.05.2025",
    due: "14.06.2025",
    amount: "₺25.000,00",
    payStatus: "Beklemede",
    payTone: "info" as const,
    eStatus: "E-Fatura Oluşturuldu",
    eTone: "info" as const
  }
] as const;

export const SKM_FATURA_CONTEXT = {
  title: "Fatura Bağlamı",
  orderNo: "SO-2025-000246",
  customer: "ABC Makina San. ve Tic. A.Ş.",
  date: "15.05.2025",
  total: "₺68.750,00",
  remaining: "₺25.000,00",
  eSummary: [
    { label: "Toplam", value: "3" },
    { label: "Gönderildi", value: "2" },
    { label: "Oluşturuldu", value: "1" },
    { label: "Hata", value: "0" },
    { label: "Toplam Tutar", value: "₺68.750,00" }
  ],
  actions: ["E-Fatura Oluştur", "Fatura Raporu", "← Siparişe Dön"],
  note: "e-Fatura entegrasyonu otomatik gönderim için yapılandırıldı.",
  updated: "31.05.2025 11:45 — Yusuf Kaya"
} as const;

export const SKM_IADE_META = {
  breadcrumb: ["Ana Sayfa", "Siparişler", "Sipariş Detayı", "İadeler"],
  orderNo: "SP-2025-000246",
  customer: "ABC İnşaat A.Ş.",
  orderDate: "12.06.2025 14:35",
  total: "₺48.250,00",
  payStatus: "Ödendi",
  orderStatus: "Tamamlandı"
} as const;

export const SKM_IADE_ROWS = [
  { no: "İA-2025-00012", date: "18.06.2025 10:25", amount: "₺1.250,00", status: "Tamamlandı", tone: "ok" as const },
  { no: "İA-2025-00010", date: "15.06.2025 16:40", amount: "₺2.130,00", status: "Onaylandı", tone: "ok" as const },
  { no: "İA-2025-00008", date: "13.06.2025 11:15", amount: "₺850,00", status: "Beklemede", tone: "warn" as const },
  { no: "İA-2025-00005", date: "12.06.2025 09:30", amount: "₺630,00", status: "Reddedildi", tone: "bad" as const }
] as const;

export const SKM_IADE_CONTEXT = {
  title: "İade Bağlamı",
  totalAmount: "₺4.860,00",
  productCount: "18 adet",
  stockOut: "-48 adet",
  stockIn: "+18 adet",
  net: "-30 adet",
  affected: "6 ürün",
  lastId: "İA-2025-00012",
  lastDate: "18.06.2025 10:25",
  lastAmount: "₺1.250,00",
  lastStatus: "Tamamlandı"
} as const;

export const SKM_ODEME_HEADER = {
  breadcrumb: ["Siparişler", "Sipariş Detayı", "Ödeme & Tahsilat"],
  orderId: "SO-2025-000124",
  status: "Onaylandı",
  created: "28.05.2025 14:30",
  customer: "ABC Makina San. ve Tic. A.Ş."
} as const;

export const SKM_ODEME_KPIS = [
  { id: "order", label: "Sipariş Tutarı", value: "₺88.750,00", tone: "green" as const },
  { id: "collected", label: "Tahsil Edilen", value: "₺53.750,00", sub: "%60,55", tone: "teal" as const },
  { id: "remaining", label: "Kalan Bakiye", value: "₺35.000,00", sub: "%39,45", tone: "orange" as const },
  { id: "currency", label: "Döviz Cinsi", value: "TRY", tone: "gold" as const }
] as const;

export const SKM_ODEME_ROWS = [
  {
    id: "RCPT-2025-000156",
    date: "28.05.2025",
    method: "Banka Havalesi",
    desc: "Akbank — Sipariş avans ödemesi",
    amount: "₺20.000,00",
    balance: "₺68.750,00"
  },
  {
    id: "RCPT-2025-000187",
    date: "02.06.2025",
    method: "Kredi Kartı",
    desc: "Garanti BBVA — Kısmi ödeme",
    amount: "₺15.750,00",
    balance: "₺53.000,00"
  },
  {
    id: "RCPT-2025-000221",
    date: "10.06.2025",
    method: "Banka Havalesi",
    desc: "İş Bankası — Ara tahsilat",
    amount: "₺18.000,00",
    balance: "₺35.000,00"
  }
] as const;

export const SKM_ODEME_CONTEXT = {
  title: "Ödeme Bağlamı",
  openBalance: "₺35.000,00",
  orderAmount: "₺88.750,00",
  collected: "₺53.750,00",
  remaining: "₺35.000,00",
  terms: "Peşin / Kısmi",
  dueDate: "27.06.2025",
  currency: "TRY",
  rateDate: "28.05.2025",
  rate: "1,0000",
  lastId: "RCPT-2025-000221",
  lastDate: "10.06.2025",
  lastAmount: "₺18.000,00",
  lastMethod: "Banka Havalesi",
  collectedPct: 60.55,
  remainingPct: 39.45
} as const;

export const SKM_TESLIMAT_ORDER = {
  orderNo: "SIP-2025-000246",
  status: "Onaylandı",
  customer: "Anadolu Yapı A.Ş.",
  orderDate: "15.05.2025 10:35",
  total: "₺125.430,00",
  remaining: "₺25.430,00"
} as const;

export const SKM_TESLIMAT_ROWS = [
  { no: "TES-2025-000178", status: "Teslim Edildi", tone: "ok" as const, date: "19.05.2025 14:20" },
  { no: "TES-2025-000165", status: "Teslim Edildi", tone: "ok" as const, date: "17.05.2025 11:05" },
  { no: "TES-2025-000142", status: "Teslim Edildi", tone: "ok" as const, date: "15.05.2025 16:45" },
  { no: "TES-2025-000121", status: "Yolda", tone: "warn" as const, date: "14.05.2025 09:30" },
  { no: "TES-2025-000098", status: "Planlandı", tone: "info" as const, date: "13.05.2025 17:10" },
  { no: "TES-2025-000075", status: "Oluşturuldu", tone: "info" as const, date: "12.05.2025 13:50" }
] as const;

export const SKM_TESLIMAT_CONTEXT = {
  title: "Teslimat Bağlamı",
  routeCode: "R-2025-0058",
  routeName: "Anadolu Yapı - Merkez Rota",
  start: "Merkez Depo",
  end: "Anadolu Yapı A.Ş.",
  distance: "48 km",
  duration: "1 sa 25 dk",
  driver: "Mehmet Yılmaz",
  phone: "0532 123 45 67",
  plate: "34 ABC 123",
  vehicle: "Kamyon",
  capacity: "4.500 kg",
  summary: [
    { label: "Toplam Teslimat", value: "6" },
    { label: "Teslim Edildi", value: "3" },
    { label: "Yolda", value: "1" },
    { label: "Planlandı", value: "1" },
    { label: "Oluşturuldu", value: "1" }
  ],
  deliveredQty: "2.850 / 4.250 adet",
  deliveryRate: "%67"
} as const;

export const SKM_TIMELINE_HEADER = {
  breadcrumb: ["Siparişler", "Sipariş Detayı"],
  orderId: "SO-2025-00568",
  status: "Onaylandı",
  meta: "Oluşturulma: 24.05.2025 10:32 • Müşteri: ABC Makina San. ve Tic. A.Ş."
} as const;

export const SKM_TIMELINE_EVENTS = [
  {
    id: "1",
    time: "24.05.2025 14:22",
    actor: "Yusuf Kaya, Yönetici",
    title: "Sipariş Onaylandı",
    desc: "Sipariş onaylandı ve işleme alındı. Durum: Taslak → Onaylandı. Not: Stok kontrolü yapıldı, teslimat planlandı.",
    tone: "green" as const
  },
  {
    id: "2",
    time: "24.05.2025 14:10",
    actor: "Zeynep Demir, Satış Uzmanı",
    title: "Sipariş Güncellendi",
    desc: "Sipariş bilgileri güncellendi. • Teslimat Tarihi: 28.05.2025 → 30.05.2025 • Ödeme Şartı: 30 Gün → 45 Gün • Not eklendi: Müşteri acil teslimat talep etti.",
    tone: "blue" as const
  },
  {
    id: "3",
    time: "24.05.2025 13:45",
    actor: "Ahmet Yılmaz, Depo Sorumlusu",
    title: "Stok Kontrolü Yapıldı",
    desc: "Ürün stok durumları kontrol edildi. • 5 ürün stokta mevcut • 2 ürün için tedarik süreci başlatıldı.",
    tone: "teal" as const
  },
  {
    id: "4",
    time: "24.05.2025 12:30",
    actor: "Zeynep Demir, Satış Uzmanı",
    title: "Teklif Dönüştürüldü",
    desc: "Teklif #TEKLIF-2025-0123 siparişe dönüştürüldü. • Teklif Tutarı: ₺85.250,00 • Sipariş Tutarı: ₺86.780,00",
    tone: "gold" as const
  },
  {
    id: "5",
    time: "24.05.2025 10:32",
    actor: "Sistem (Otomatik)",
    title: "Sipariş Oluşturuldu",
    desc: "Yeni sipariş kaydı oluşturuldu. Sipariş No: SO-2025-00568. Kaynak: Web Portal.",
    tone: "green" as const
  }
] as const;

export const SKM_TIMELINE_CONTEXT = {
  title: "Sipariş Bağlamı",
  orderNo: "SO-2025-00568",
  status: "Onaylandı",
  customer: "ABC Makina San. ve Tic. A.Ş.",
  total: "₺86.780,00",
  created: "24.05.2025 10:32",
  delivery: "30.05.2025",
  rep: "Zeynep Demir",
  quick: [
    { label: "Toplam Ürün", value: "7" },
    { label: "KDV Hariç", value: "₺72.316,67" },
    { label: "KDV", value: "₺14.463,33" },
    { label: "Toplam", value: "₺86.780,00" }
  ],
  payStatus: "Beklemede",
  shipStatus: "Planlandı",
  related: [
    { label: "Müşteri Profili", href: "#" },
    { label: "Teklif TEKLIF-2025-0123", href: "#" },
    { label: "2 Fatura", href: "#" },
    { label: "1 Sevkiyat", href: "#" }
  ],
  actions: ["Sipariş Yazdır", "Fatura Oluştur", "Sevkiyat Oluştur", "İptal Et"]
} as const;
