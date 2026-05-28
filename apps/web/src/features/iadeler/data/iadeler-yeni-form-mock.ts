// @ts-nocheck
export const IYF_PAGE = {
  breadcrumb: ["İade Yönetimi", "Yeni İade Formu"],
  cancel: "İptal",
  save: "Kaydet"
} as const;

export const IYF_STEPS = [
  "Sipariş Satır Seçimi",
  "İade Bilgileri",
  "Depo Etkisi",
  "Onay"
] as const;

export const IYF_ORDER = {
  title: "Sipariş Bilgileri",
  fields: [
    { label: "Sipariş No", value: "SIP-2025-000124" },
    { label: "Tarih", value: "15.05.2025 14:30" },
    { label: "Cari", value: "ABC Elektrik Ltd. �?ti." },
    { label: "Toplam Tutar", value: "₺25.680,00" }
  ]
} as const;

export const IYF_LINES = [
  {
    id: "1",
    code: "UR-10001",
    name: "Rulman 6205 2RS",
    variant: "—",
    unitPrice: "₺85,00",
    orderQty: "10",
    returnable: "10",
    returnQty: "2",
    unit: "Adet",
    lineTotal: "₺170,00",
    selected: true
  },
  {
    id: "2",
    code: "UR-10002",
    name: "V Kayışı SPB 1600",
    variant: "—",
    unitPrice: "₺120,00",
    orderQty: "5",
    returnable: "5",
    returnQty: "1",
    unit: "Adet",
    lineTotal: "₺120,00",
    selected: true
  },
  {
    id: "3",
    code: "UR-10003",
    name: "Elektrik Motoru 7.5 kW",
    variant: "—",
    unitPrice: "₺8.750,00",
    orderQty: "2",
    returnable: "2",
    returnQty: "0",
    unit: "Adet",
    lineTotal: "₺0,00",
    selected: false
  },
  {
    id: "4",
    code: "UR-10004",
    name: "Hava Filtresi AF-261",
    variant: "—",
    unitPrice: "₺210,00",
    orderQty: "3",
    returnable: "3",
    returnQty: "0",
    unit: "Adet",
    lineTotal: "₺0,00",
    selected: false
  }
] as const;

export const IYF_SELECTED_TOTAL = "Seçilen İade Toplamı: 3 kalem / ₺290,00";

export const IYF_INFO =
  "İade edilebilir miktar, daha önce iade edilen miktarlar düşülerek hesaplanır.";

export const IYF_WARN = "Devam etmek için en az bir ürün seçmelisiniz.";

export const IYF_WHY = {
  title: "Neden Depo Etkisi?",
  points: ["Doğru Depo", "Güncel Stok", "İzlenebilirlik"]
} as const;

export const IYF_PREVIEW = {
  title: "Depo Etkisi Önizleme",
  warehouse: "Merkez Depo",
  stats: [
    { label: "Toplam Kalem", value: "3" },
    { label: "Toplam İade Miktarı", value: "3" },
    { label: "Toplam İade Tutarı", value: "₺290,00" }
  ],
  details: [
    "Stok Artışı: 3 ürün",
    "Depo Girişi: Merkez Depo",
    "Tahmini İşlem Süresi: ~ 2 saniye"
  ],
  continue: "Devam Et",
  continueHint: "İade Bilgileri adımına geçin"
} as const;

