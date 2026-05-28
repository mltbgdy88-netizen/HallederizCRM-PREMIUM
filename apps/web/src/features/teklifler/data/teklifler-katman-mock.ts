// @ts-nocheck
export type KatmanTabId =
  | "ozet"
  | "satirlar"
  | "musteri"
  | "timeline"
  | "belgeler"
  | "donusum";

export const KATMAN_TABS: { id: KatmanTabId; label: string; href: string }[] = [
  { id: "ozet", label: "Özet", href: "/teklifler/katman/ozet" },
  { id: "satirlar", label: "Satırlar", href: "/teklifler/katman/satirlar" },
  { id: "musteri", label: "Müşteri", href: "/teklifler/katman/musteri" },
  { id: "donusum", label: "Dönüşüm", href: "/teklifler/katman/donusum" },
  { id: "belgeler", label: "Belgeler", href: "/teklifler/katman/belgeler" },
  { id: "timeline", label: "Timeline", href: "/teklifler/katman/timeline" }
];

export const SATIRLAR_DETAIL_TABS: {
  label: string;
  badge?: string;
  active?: boolean;
}[] = [
  { label: "Genel Bilgiler" },
  { label: "Kalemler", active: true },
  { label: "Notlar" },
  { label: "Koşullar" },
  { label: "Ekler" },
  { label: "Onay Süreci" },
  { label: "Geçmiş" }
];

export const TIMELINE_DETAIL_TABS: {
  label: string;
  badge?: string;
  active?: boolean;
}[] = [
  { label: "Genel Bilgiler" },
  { label: "Ürünler" },
  { label: "Fiyatlandırma" },
  { label: "Müşteri" },
  { label: "Ekler" },
  { label: "Notlar" },
  { label: "Timeline", active: true },
  { label: "Onay Süreci" },
  { label: "İlgili Kayıtlar" }
];

export const OZET_HEADER = {
  breadcrumb: ["Teklifler", "Teklif Detayı"],
  backLabel: "← Teklifler Listesine Dön",
  title: "Teklif TK-8821",
  customer: "ABC Makina San. ve Tic. A.Ş.",
  customerBadge: "Kurumsal",
  taxNo: "1234567890",
  contact: "Ahmet Yılmaz"
};

export const OZET_KPIS = [
  { id: "amount", label: "Teklif Tutarı", value: "₺886.750,00", sub: "KDV Hariç", tone: "green" as const },
  { id: "vat", label: "KDV Tutarı", value: "₺177.350,00", sub: "%20 KDV", tone: "teal" as const },
  { id: "total", label: "Toplam Tutar", value: "₺1.064.100,00", sub: "KDV Dahil", tone: "green" as const },
  { id: "valid", label: "Geçerlilik Tarihi", value: "28.06.2025", sub: "20 gün kaldı", tone: "orange" as const }
];

export const OZET_DETAILS_LEFT = [
  { label: "Teklif Numarası", value: "TK-8821" },
  { label: "Teklif Tarihi", value: "29.05.2025 14:30" },
  { label: "Geçerlilik Tarihi", value: "28.06.2025" },
  { label: "Teklif Tipi", value: "Standart", badge: "ok" as const },
  { label: "Para Birimi", value: "TRY" },
  { label: "Ödeme Koşulu", value: "30 Gün" },
  { label: "Teslimat Süresi", value: "5-7 İş Günü" },
  { label: "Oluşturan", value: "Yusuf Kaya", avatar: true },
  { label: "Açıklama", value: "-" }
];

export const OZET_DETAILS_RIGHT = [
  { label: "Teklif Durumu", value: "Açık", badge: "ok" as const },
  { label: "İndirim Tutarı", value: "₺25.000,00" },
  { label: "İndirim Oranı", value: "%2,74" },
  { label: "Kampanya", value: "Bahar Kampanyası" },
  { label: "Fiyat Listesi", value: "Standart Fiyat Listesi" },
  { label: "Sevkiyat Şekli", value: "Kara Yolu" },
  { label: "Teklif Kaynağı", value: "Web Sitesi" },
  { label: "Son Güncelleme", value: "29.05.2025 14:30" }
];

export const KATMAN_CONTEXT = {
  title: "Teklif Katman Bağlamı",
  teklif: [
    { label: "Teklif No", value: "TK-8821" },
    { label: "Durum", value: "Açık", badge: "ok" as const },
    { label: "Teklif Tarihi", value: "29.05.2025" },
    { label: "Geçerlilik", value: "28.06.2025" },
    { label: "Toplam", value: "₺1.064.100,00" }
  ],
  musteri: [
    { label: "Müşteri", value: "ABC Makina San. ve Tic. A.Ş." },
    { label: "Müşteri Kodu", value: "M-10015" },
    { label: "Yetkili", value: "Ahmet Yılmaz" },
    { label: "Telefon", value: "+90 212 555 12 34" },
    { label: "E-posta", value: "ahmet@abcmakina.com" }
  ],
  ozet: [
    { label: "Ara Toplam", value: "₺886.750,00" },
    { label: "İndirim", value: "-₺25.000,00", negative: true },
    { label: "KDV", value: "₺177.350,00" },
    { label: "Toplam Tutar", value: "₺1.064.100,00", strong: true }
  ],
  actions: ["Teklifi Düzenle", "Satırları Yönet", "PDF Olarak İndir", "Teklifi Kopyala", "Teklifi İptal Et"]
};

export const SATIRLAR_HEADER = {
  breadcrumb: ["Ana Sayfa", "Teklifler", "TEK-2025-00123"],
  title: "Teklifler",
  quoteId: "TEK-2025-00123",
  status: "Onay Bekliyor",
  customer: "ABC İnşaat A.Ş.",
  offerDate: "15.05.2025",
  validUntil: "30.05.2025",
  currency: "TRY — Türk Lirası",
  total: "₺167.450,00"
};

export const SATIRLAR_ROWS = [
  { code: "UR-10001", name: "Rulman 6205 2RS", desc: "Standart rulman", qty: "12", unit: "Adet", price: "₺450,00", discPct: "%5", discAmt: "₺270,00", vat: "%20", total: "₺5.130,00" },
  { code: "UR-10002", name: "V Kayış A-52", desc: "Endüstriyel kayış", qty: "8", unit: "Adet", price: "₺320,00", discPct: "%0", discAmt: "₺0,00", vat: "%20", total: "₺3.072,00" },
  { code: "UR-10003", name: "Elektrik Motoru 7.5 kW", desc: "7.5 kW üç faz motor", qty: "2", unit: "Adet", price: "₺18.500,00", discPct: "%3", discAmt: "₺1.110,00", vat: "%20", total: "₺35.962,00" },
  { code: "UR-10004", name: "Hava Filtresi AF-261", desc: "Panel filtre", qty: "24", unit: "Adet", price: "₺185,00", discPct: "%2", discAmt: "₺88,80", vat: "%20", total: "₺5.232,00" },
  { code: "UR-10005", name: "Hidrolik Yağ 46 20L", desc: "Hidrolik yağ 20L", qty: "6", unit: "Adet", price: "₺42.000,00", discPct: "%0", discAmt: "₺0,00", vat: "%20", total: "₺50.400,00" },
  { code: "UR-10006", name: "Kontrol Paneli", desc: "PLC kontrol", qty: "1", unit: "Adet", price: "₺28.750,00", discPct: "%5", discAmt: "₺1.437,50", vat: "%20", total: "₺32.775,00" },
  { code: "UR-10007", name: "Basınç Sensörü 0-250 Bar", desc: "Basınç sensörü", qty: "3", unit: "Adet", price: "₺890,00", discPct: "%0", discAmt: "₺0,00", vat: "%20", total: "₺6.408,00" },
  { code: "UR-10008", name: "Küresel Vana DN25", desc: "Küresel vana DN25", qty: "50", unit: "Adet", price: "₺42,00", discPct: "%0", discAmt: "₺0,00", vat: "%20", total: "₺2.520,00" }
];

export const SATIRLAR_SUMMARY = [
  { label: "Ara Toplam", value: "₺138.005,00" },
  { label: "Toplam İskonto", value: "₺1.265,00" },
  { label: "KDV Matrahı", value: "₺136.740,00" },
  { label: "KDV (%20)", value: "₺27.348,00" },
  { label: "Genel Toplam", value: "₺167.450,00", strong: true }
];

export const SATIRLAR_STOCK = [
  {
    code: "UR-10003",
    name: "Elektrik Motoru 7.5 kW",
    avail: "2 adet",
    request: "2 adet",
    limit: "2 adet",
    text: "Stok = talep",
    tone: "warn" as const
  },
  {
    code: "UR-10005",
    name: "Hidrolik Yağ 46 20L",
    avail: "6 adet",
    request: "6 adet",
    limit: "10 adet",
    text: "Stok = talep",
    tone: "warn" as const
  },
  {
    code: "UR-10007",
    name: "Basınç Sensörü 0-250 Bar",
    avail: "3 adet",
    request: "3 adet",
    limit: "5 adet",
    text: "Kısmi stok",
    tone: "info" as const
  },
  {
    code: "UR-10004",
    name: "Hava Filtresi AF-261",
    avail: "15 adet",
    request: "5 adet",
    limit: "5 adet",
    text: "Yeterli stok",
    tone: "ok" as const
  }
];

export const MUSTERI_PAGE = {
  title: "Teklifler",
  subtitle: "Müşteri bazlı teklif performansı ve geçmiş kayıtları",
  hubTabs: ["Teklifler", "Ürünler", "Müşteri", "Ekip", "Finansal", "Aktivite"],
  customer: "Koç Holding A.Ş.",
  snapshot: [
    { label: "Toplam Teklif", value: "28" },
    { label: "Kazanılan", value: "15", sub: "%53,6", tone: "ok" as const },
    { label: "Beklemede", value: "8", sub: "%28,6", tone: "warn" as const },
    { label: "Kaybedilen", value: "5", sub: "%17,8", tone: "bad" as const },
    { label: "Toplam Değer", value: "₺4.850.000" },
    { label: "Ortalama Değer", value: "₺173.214" }
  ],
  risk: {
    label: "Yüksek Risk",
    items: [
      { label: "Vadesi Geçmiş Teklif", value: "3", tone: "bad" as const },
      { label: "Yanıtsız Teklif", value: "5", tone: "warn" as const },
      { label: "Süreç Aşımı", value: "2", tone: "orange" as const }
    ]
  }
};

export const MUSTERI_HISTORY = [
  { no: "TKL-2025-0289", title: "Fabrika Otomasyon Sistemi", amount: "₺850.000", created: "12.05.2025", end: "12.06.2025", status: "Teklif", prob: "%40", owner: "Yusuf Kaya" },
  { no: "TKL-2025-0271", title: "Enerji İzleme Modülü", amount: "₺420.000", created: "02.05.2025", end: "02.06.2025", status: "Beklemede", prob: "%55", owner: "Merve Demir" },
  { no: "TKL-2025-0244", title: "Bakım Sözleşmesi Yenileme", amount: "₺180.000", created: "18.04.2025", end: "18.05.2025", status: "Kaybedildi", prob: "%20", owner: "Yusuf Kaya" },
  { no: "TKL-2025-0210", title: "Depo Otomasyonu", amount: "₺1.250.000", created: "05.04.2025", end: "05.05.2025", status: "Kazanıldı", prob: "%100", owner: "Ali Katırcı" },
  { no: "TKL-2025-0198", title: "PLC Modernizasyon", amount: "₺680.000", created: "22.03.2025", end: "22.04.2025", status: "Teklif", prob: "%35", owner: "Yusuf Kaya" }
];

export const MUSTERI_CONTEXT = {
  name: "Koç Holding A.Ş.",
  code: "Müşteri • KUR-0001",
  badge: "Aktif",
  fields: [
    { label: "Vergi No", value: "1234567890" },
    { label: "Yetkili", value: "Ahmet Yılmaz" },
    { label: "Telefon", value: "+90 212 555 00 01" },
    { label: "E-posta", value: "info@koc.com.tr" },
    { label: "Sektör", value: "Holding" },
    { label: "Konum", value: "İstanbul, Türkiye" }
  ],
  contacts: [
    { name: "Ahmet Yılmaz", role: "Satın Alma Müdürü", email: "ahmet@koc.com.tr", phone: "+90 532 111 22 33", primary: true },
    { name: "Merve Demir", role: "Proje Yöneticisi", email: "merve@koc.com.tr", phone: "+90 532 222 33 44", primary: false },
    { name: "Ali Katırcı", role: "Teknik Sorumlu", email: "ali@koc.com.tr", phone: "+90 532 333 44 55", primary: false }
  ],
  limits: {
    credit: "₺10.000.000",
    used: "₺6.250.000",
    remaining: "₺3.750.000",
    usagePct: 62
  }
};

export const TIMELINE_HEADER = {
  breadcrumb: ["Teklifler", "TEK-2025-000124"],
  quoteId: "TEK-2025-000124",
  status: "Teklif Oluşturuldu",
  customer: "ABC Makine San. ve Tic. A.Ş.",
  created: "20.05.2025 10:15",
  creator: "Yusuf Kaya"
};

export const TIMELINE_EVENTS = [
  { id: "1", title: "Teklif oluşturuldu", desc: "Yeni teklif kaydı açıldı.", actor: "Yusuf Kaya", time: "20.05.2025 10:15:23", tone: "create" as const },
  { id: "2", title: "Teklif bilgileri güncellendi", desc: "Geçerlilik tarihi ve ödeme koşulu güncellendi.", actor: "Yusuf Kaya", time: "20.05.2025 10:22:41", tone: "edit" as const },
  { id: "3", title: "Ürün eklendi", desc: "5 adet yeni ürün eklendi", actor: "Yusuf Kaya", time: "20.05.2025 10:25:17", tone: "product" as const },
  { id: "4", title: "Fiyat güncellendi", desc: "Toplam tutar ₺125.430,00 olarak güncellendi", actor: "Yusuf Kaya", time: "20.05.2025 10:28:33", tone: "price" as const },
  { id: "5", title: "Teklif paylaşıldı", desc: "Teklif linki e-posta ile paylaşıldı: info@abcmakina.com", actor: "Yusuf Kaya", time: "20.05.2025 10:30:12", tone: "share" as const },
  { id: "6", title: "Teklif görüntülendi", desc: "Teklif müşteri tarafından görüntülendi", actor: "Sistem", time: "20.05.2025 11:05:47", tone: "view" as const },
  { id: "7", title: "Teklif indirildi", desc: "Teklif PDF olarak indirildi", actor: "Sistem", time: "20.05.2025 11:06:02", tone: "download" as const },
  { id: "8", title: "Teklif revize edildi", desc: "İskonto oranı %12 olarak güncellendi", actor: "Yusuf Kaya", time: "20.05.2025 11:15:34", tone: "edit" as const },
  { id: "9", title: "Teklif onaya gönderildi", desc: "Teklif onay sürecine gönderildi", actor: "Yusuf Kaya", time: "20.05.2025 11:18:09", tone: "approval" as const },
  { id: "10", title: "Durum değişti", desc: "Durum: Teklif Oluşturuldu → Onayda", actor: "Sistem", time: "20.05.2025 11:18:15", tone: "status" as const }
];

export const TIMELINE_CONTEXT = {
  teklifNo: "TEK-2025-000124",
  musteri: "ABC Makine San. ve Tic. A.Ş.",
  durum: "Onayda",
  toplam: "₺125.430,00",
  olusturma: "20.05.2025 10:15",
  gecerlilik: "20.06.2025",
  olusturan: "Yusuf Kaya",
  note: "Müşteri özel indirim talep etti. %15 iskonto uygulanabilir.",
  noteMeta: "Yusuf Kaya · 20.05.2025 10:35"
};

export const BELGELER_HEADER = {
  breadcrumb: ["Teklifler", "Teklif Detayı"],
  quoteId: "TEK-2025-000124",
  status: "Gönderildi",
  customer: "ABC Teknoloji A.Ş.",
  offerDate: "15.05.2025",
  validUntil: "15.06.2025",
  currency: "TRY",
  total: "₺85.750,00"
};

export const BELGELER_DETAIL_TABS: {
  label: string;
  badge?: string;
  active?: boolean;
}[] = [
  { label: "Özet" },
  { label: "Ürünler", badge: "7" },
  { label: "Fiyatlandırma" },
  { label: "Müşteri" },
  { label: "Açıklamalar" },
  { label: "Belgeler", active: true },
  { label: "Geçmiş" }
];

export const BELGELER_DOCUMENTS = [
  {
    id: "1",
    name: "TEK-2025-000124_Teklif.pdf",
    type: "Teklif",
    uploadedAt: "15.05.2025 14:32",
    uploader: "Yusuf Kaya",
    size: "245 KB",
    selected: true
  },
  {
    id: "2",
    name: "TEK-2025-000124_Kapsam.pdf",
    type: "Kapsam",
    uploadedAt: "15.05.2025 14:35",
    uploader: "Yusuf Kaya",
    size: "120 KB",
    selected: false
  },
  {
    id: "3",
    name: "TEK-2025-000124_Teknik_Sartname.pdf",
    type: "Teknik Şartname",
    uploadedAt: "15.05.2025 14:37",
    uploader: "Yusuf Kaya",
    size: "380 KB",
    selected: false
  },
  {
    id: "4",
    name: "TEK-2025-000124_Vade_Plani.pdf",
    type: "Vade Planı",
    uploadedAt: "15.05.2025 14:40",
    uploader: "Yusuf Kaya",
    size: "98 KB",
    selected: false
  },
  {
    id: "5",
    name: "TEK-2025-000124_Diger_Kosullar.pdf",
    type: "Diğer",
    uploadedAt: "15.05.2025 14:42",
    uploader: "Yusuf Kaya",
    size: "156 KB",
    selected: false
  }
];

export const BELGELER_PREVIEW = {
  filename: "TEK-2025-000124_Teklif.pdf",
  size: "245 KB",
  page: "1 / 6",
  zoom: "%100"
};

export const DONUSUM_HEADER = {
  title: "Teklif #TKL-2025-00048",
  status: "Onaylandı",
  created: "16.06.2025 10:35",
  validUntil: "30.06.2025",
  currency: "TRY"
};

export const DONUSUM_DETAIL_TABS = [
  "Genel Bilgiler",
  "Kalemler",
  "Fiyatlama",
  "Koşullar",
  "Onay",
  "Dönüşüm",
  "Notlar",
  "Aktivite",
  "Ekler"
] as const;

export const DONUSUM_STEPS = [
  { id: 1, label: "Stok Onayı", done: true, current: true },
  { id: 2, label: "Dönüşüm Ayarları", done: false, current: false },
  { id: 3, label: "Önizleme", done: false, current: false },
  { id: 4, label: "Tamamla", done: false, current: false }
];

export const DONUSUM_STOCK_SUMMARY = [
  { label: "Toplam Kalem", value: "6" },
  { label: "Stokta Mevcut", value: "5", tone: "ok" as const },
  { label: "Kritik (Kısmi)", value: "1", tone: "warn" as const },
  { label: "Stokta Yok", value: "0", tone: "bad" as const },
  { label: "Toplam Tutar", value: "₺11.515,00", strong: true }
];

export const DONUSUM_STOCK_ROWS = [
  { product: "Hava Filtresi AF-261", status: "Stokta", statusTone: "ok" as const, avail: "80", need: "80", action: null },
  { product: "Hidrolik Yağ 46 20L", status: "Stokta", statusTone: "ok" as const, avail: "200", need: "200", action: null },
  { product: "Dişli Çark Z-24", status: "Kısmi", statusTone: "warn" as const, avail: "30", need: "75", action: "Alternatif Öner" },
  { product: "Basınç Sensörü 0-250 Bar", status: "Stokta", statusTone: "ok" as const, avail: "90", need: "90", action: null },
  { product: "Küresel Vana DN25", status: "Stokta", statusTone: "ok" as const, avail: "150", need: "150", action: null },
  { product: "Elektrik Motoru 7.5 kW", status: "Stokta", statusTone: "ok" as const, avail: "120", need: "120", action: null }
];

export const DONUSUM_CONTEXT = {
  title: "Dönüşüm Bağlamı",
  teklif: [
    { label: "Teklif No", value: "TKL-2025-00048" },
    { label: "Teklif Tarihi", value: "16.06.2025" },
    { label: "Müşteri", value: "Rulman A.Ş." },
    { label: "Para Birimi", value: "TRY" },
    { label: "Toplam Tutar", value: "₺11.515,00" }
  ],
  musteri: [
    { label: "Adres", value: "Sanayi Mah. İkitelli OSB Başakşehir / İstanbul" },
    { label: "Vergi No", value: "734 056 7890" },
    { label: "Yetkili", value: "Ahmet Yılmaz" },
    { label: "Telefon", value: "+90 212 555 10 20" }
  ],
  ozet: [
    { label: "Dönüşüm Tipi", value: "Sipariş" },
    { label: "Hedef Depo", value: "Merkez Depo" },
    { label: "Tahmini Teslimat", value: "18.06.2025" },
    { label: "Ödeme Koşulu", value: "30 Gün" }
  ],
  footerNote: "Sipariş oluşturulduktan sonra teklifle ilişkilendirilecektir."
};
