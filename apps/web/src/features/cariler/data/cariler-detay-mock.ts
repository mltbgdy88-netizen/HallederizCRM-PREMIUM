// @ts-nocheck
export const CDM_HERO = {
  initials: "UR",
  title: "UR-10001 Rulman 6205 2RS",
  status: "Aktif",
  meta: [
    { label: "Cari Kodu", value: "CR-000245" },
    { label: "Cari Grubu", value: "Sanayi" },
    { label: "Vergi Dairesi", value: "Erenköy" },
    { label: "VKN", value: "8681234567800" }
  ]
} as const;

export const CDM_TABS = [
  "Özet",
  "İletişim",
  "Finans",
  "Teklifler",
  "Siparişler",
  "Tahsilatlar",
  "Timeline"
] as const;

export type CdmTab = (typeof CDM_TABS)[number];

export const CDM_SUMMARY = {
  title: "Cari Özeti",
  fields: [
    { label: "Cari Adı", value: "UR-10001 Rulman 6205 2RS" },
    { label: "Firma Ünvanı", value: "Rulman 6205 2RS San. ve Tic. Ltd. �?ti." },
    { label: "Cari Grubu", value: "Sanayi" },
    { label: "Fiyat Grubu", value: "Standart" },
    { label: "Para Birimi", value: "TRY" },
    { label: "Durum", value: "Aktif", badge: true },
    { label: "Kayıt Tarihi", value: "12.02.2025 10:15" },
    { label: "Son Güncelleme", value: "22.05.2025 14:32" }
  ],
  address: "İçerenköy Mah. Kayışdağı Cad. No: 125/3 Ataşehir / İstanbul",
  tags: [
    { label: "Önemli", tone: "gold" as const },
    { label: "Sanayi", tone: "green" as const },
    { label: "Uzun Vadeli", tone: "neutral" as const }
  ]
} as const;

export const CDM_COMMERCIAL = {
  title: "Ticari Bilgiler",
  fields: [
    { label: "Ödeme Vadesi", value: "30 Gün" },
    { label: "Kredi Limiti", value: "₺250.000,00" },
    { label: "Risk Limiti", value: "₺300.000,00" },
    { label: "İskonto Oranı", value: "%2,00" },
    { label: "Fiyat Listesi", value: "Sanayi Fiyat Listesi" }
  ],
  rep: { initials: "YK", name: "Yusuf Kaya" },
  contacts: [
    { id: "phone", label: "Telefon", value: "+90 (216) 455 45 45" },
    { id: "mobile", label: "Mobil", value: "+90 (532) 123 45 67" },
    { id: "email", label: "E-posta", value: "info@rulman6205.com" },
    { id: "web", label: "Web", value: "www.rulman6205.com" }
  ],
  note: "Uzun vadeli iş birliği hedeflenmektedir."
} as const;

export const CDM_PERFORMANCE = {
  title: "Cari Performans Özeti",
  rows: [
    { label: "Toplam Ciro (Yıllık)", value: "₺1.245.680,00", icon: "chart" as const },
    { label: "Toplam Tahsilat (Yıllık)", value: "₺1.102.350,00", icon: "wallet" as const },
    { label: "Toplam Sipariş (Yıllık)", value: "42", icon: "cart" as const },
    { label: "Açık Sipariş Tutarı", value: "₺143.330,00", icon: "open" as const },
    { label: "Ortalama Sipariş Tutarı", value: "₺29.659,05", icon: "avg" as const },
    { label: "Son Sipariş Tarihi", value: "20.05.2025", icon: "calendar" as const },
    { label: "Son Tahsilat Tarihi", value: "18.05.2025", icon: "calendar" as const }
  ]
} as const;

export const CDM_RISK = {
  title: "Risk ve Limit Durumu",
  fields: [
    { label: "Kredi Limiti", value: "₺250.000,00" },
    { label: "Risk Limiti", value: "₺300.000,00" },
    { label: "Kullanılan Limit", value: "₺143.330,00" }
  ],
  usageLabel: "Kullanım Oranı",
  usagePct: "%57,33"
} as const;

export const CDM_CONTEXT = {
  title: "Cari Bağlamı",
  rows: [
    { label: "Sektör", value: "Otomotiv Yan Sanayi" },
    { label: "Müşteri Tipi", value: "Kurumsal" },
    { label: "İşbirliği Süresi", value: "2 Yıl 4 Ay" },
    { label: "Çalışma Durumu", value: "Devam Ediyor", live: true },
    { label: "Son Görüşme", value: "20.05.2025" },
    { label: "Son Not", value: "Fiyat güncellemesi talep edildi." }
  ]
} as const;

export const CDM_WARNINGS = {
  title: "Uyarılar",
  items: [
    {
      title: "Açık sipariş tutarı yüksek",
      detail: "Toplam açık sipariş tutarı limiti aşıyor."
    },
    {
      title: "Risk limiti kullanım oranı yüksek",
      detail: "Risk limiti kullanım oranı %75'i geçebilir."
    }
  ]
} as const;

export const CDM_NEXT_STEPS = {
  title: "Sonraki Adımlar",
  items: [
    { label: "Fiyat güncellemesi ilet", date: "25.05.2025" },
    { label: "Yeni katalog gönder", date: "28.05.2025" },
    { label: "Çeyrek değerlendirme toplantısı", date: "05.06.2025" }
  ],
  cta: "+ Yeni Aksiyon Ekle"
} as const;

