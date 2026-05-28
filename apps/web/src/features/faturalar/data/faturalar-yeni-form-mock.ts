// @ts-nocheck
export const FYF_PAGE = {
  title: "Yeni Fatura",
  subtitle: "Müşterinize yeni bir fatura oluşturun."
} as const;

export const FYF_ACTIONS = {
  draft: "Taslak Kaydet",
  preview: "Önizleme",
  create: "Faturayı Oluştur"
} as const;

export const FYF_CARI = {
  title: "Cari Bilgileri",
  fields: [
    { label: "Cari Adı", placeholder: "Cari seçin...", type: "select" as const },
    { label: "Vergi Dairesi", placeholder: "", type: "text" as const },
    { label: "Vergi No / TCKN", placeholder: "", type: "text" as const },
    { label: "Adres", placeholder: "", type: "textarea" as const }
  ]
} as const;

export const FYF_INVOICE = {
  title: "Fatura Bilgileri",
  fields: [
    { label: "Fatura No", value: "FA-2025-000123" },
    { label: "Fatura Tarihi", value: "17.05.2025" },
    { label: "Vade Tarihi", value: "24.05.2025" },
    { label: "Para Birimi", value: "TRY - Türk Lirası" },
    { label: "Döviz Kuru", value: "1,0000" }
  ]
} as const;

export const FYF_OTHER = {
  title: "Diğer Bilgiler",
  fields: [
    { label: "Sevk Adresi", placeholder: "Opsiyonel" },
    { label: "Açıklama", placeholder: "Opsiyonel" },
    { label: "Ödeme Şekli", placeholder: "Seçiniz" },
    { label: "Proje", placeholder: "Seçiniz" }
  ]
} as const;

export const FYF_LINE_COLUMNS = [
  "#",
  "Ürün / Hizmet",
  "Açıklama",
  "Miktar",
  "Birim",
  "Birim Fiyat",
  "İskonto %",
  "İskonto Tutarı",
  "KDV Oranı",
  "KDV Tutarı",
  "Tutar",
  "İşlem"
] as const;

export const FYF_LINES = [
  {
    no: "1",
    product: "Ürün seçin...",
    description: "",
    qty: "1,00",
    unit: "Adet",
    price: "0,00",
    discountPct: "0,00",
    discountAmt: "0,00",
    vatRate: "%20",
    vatAmt: "0,00",
    total: "0,00"
  }
] as const;

export const FYF_LINE_ACTIONS = ["+ Satır Ekle", "Ürün Ekle", "Hizmet Ekle"] as const;

export const FYF_VAT_ROWS = [
  { rate: "%20", base: "0,00", vat: "0,00" },
  { rate: "%10", base: "0,00", vat: "0,00" },
  { rate: "%1", base: "0,00", vat: "0,00" },
  { rate: "%0", base: "0,00", vat: "0,00" }
] as const;

export const FYF_TOTALS = {
  subtotal: "0,00 ₺",
  discount: "0,00 ₺",
  taxBase: "0,00 ₺",
  totalVat: "0,00 ₺",
  grand: "0,00 ₺"
} as const;

export const FYF_INFO =
  "Fatura oluşturulduktan sonra düzenlenebilir. Taslaklar Raporlar > Faturalar bölümünden yönetilir.";
