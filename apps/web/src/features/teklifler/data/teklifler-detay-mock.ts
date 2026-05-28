// @ts-nocheck
export const TDM_PAGE = {
  breadcrumb: ["Teklifler", "Teklif Detayı"],
  title: "Teklif Detayı"
} as const;

export const TDM_HERO = {
  number: "TK-8821",
  numberLabel: "Teklif Numarası",
  status: "Müşteri Durumunda",
  created: "Oluşturulma: 18.06.2025 10:30",
  updated: "Son Güncelleme: 18.06.2025 11:45",
  customer: "ABC Makine San. ve Tic. A.�?.",
  contact: "Ahmet Yılmaz",
  email: "ahmet.yilmaz@abcmakine.com",
  total: "₺125.430,00",
  totalNote: "KDV Dahil"
} as const;

export const TDM_TABS = [
  "Özet",
  "Satırlar",
  "Müşteri",
  "Dönüşüm",
  "Belgeler",
  "Timeline"
] as const;

export type TdmTab = (typeof TDM_TABS)[number];

export const TDM_KPIS = [
  {
    id: "validity",
    label: "Geçerlilik Tarihi",
    value: "18.07.2025",
    sub: "30 gün kaldı",
    subTone: "warn" as const,
    icon: "calendar" as const
  },
  {
    id: "total",
    label: "Toplam Tutar",
    value: "₺125.430,00",
    sub: "KDV Dahil",
    subTone: "muted" as const,
    icon: "money" as const
  },
  {
    id: "discount",
    label: "İskonto Tutarı",
    value: "₺8.750,00",
    sub: "%6,52",
    subTone: "muted" as const,
    icon: "tag" as const
  },
  {
    id: "lines",
    label: "Satır Sayısı",
    value: "6",
    sub: "Ürün / Hizmet",
    subTone: "muted" as const,
    icon: "list" as const
  }
] as const;

export const TDM_SUMMARY_FIELDS = [
  { label: "Teklif Numarası", value: "TK-8821" },
  { label: "Oluşturulma Tarihi", value: "18.06.2025 10:30" },
  { label: "Geçerlilik Tarihi", value: "18.07.2025" },
  { label: "Fiyat Listesi", value: "Standart Fiyat Listesi" },
  { label: "Ödeme Koşulu", value: "30 Gün" },
  { label: "Teslimat Koşulu", value: "FD - Fabrika Teslim" },
  { label: "Para Birimi", value: "TRY - Türk Lirası" },
  { label: "Açıklama", value: "Otomasyon hattı için ekipman teklifi.", full: true },
  { label: "Teklif Sahibi", value: "Yusuf Kaya", avatar: "YK" },
  { label: "Departman", value: "Satış Departmanı" },
  { label: "Proje", value: "Otomasyon Hattı Projesi" },
  {
    label: "Etiketler",
    value: "",
    tags: ["Otomasyon", "2025"]
  }
] as const;

export const TDM_CONTEXT = {
  title: "Teklif Bağlamı",
  rows: [
    { label: "Kaynak", value: "Web Sitesi" },
    { label: "Fırsat", value: "F-7721 - Otomasyon Hattı", link: true },
    { label: "Aşama", value: "Teklif Aşaması" },
    { label: "Olasılık", value: "%60" },
    { label: "Bölge", value: "Marmara Bölgesi" },
    { label: "Atanan", value: "Yusuf Kaya", avatar: "YK" },
    { label: "Notlar", value: "Müşteri teknik şartname paylaştı.", full: true }
  ]
} as const;

export const TDM_CONVERT = {
  title: "Siparişe Dönüştür",
  text: "Bu teklifi siparişe dönüştürerek sipariş sürecini başlatın.",
  cta: "Siparişe Dönüştür →"
} as const;

