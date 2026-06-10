// @ts-nocheck
export const TSYF_FORM = {
  title: "Yeni Teslimat Oluştur",
  subtitle: "Teslimat bilgilerini girin ve ürünlerinizi müşteriye ulaştırın."
} as const;

export const TSYF_TOP_FIELDS = [
  { id: "address", label: "Teslimat Adresi", placeholder: "Adres seçin...", addLabel: "+ Yeni Adres Ekle" },
  { id: "date", label: "Teslimat Tarihi", value: "20.05.2025" },
  { id: "driver", label: "�?oför", placeholder: "�?oför seçin...", addLabel: "+ Yeni �?oför Ekle" },
  { id: "vehicle", label: "Araç", placeholder: "Araç seçin...", addLabel: "+ Yeni Araç Ekle" }
] as const;

export const TSYF_PRODUCT_ROW = {
  product: "Ürün seçin...",
  stock: "—",
  quantity: "Miktar girin",
  unit: "Birim seçin",
  unitPrice: "₺0,00",
  total: "₺0,00"
} as const;

export const TSYF_SUMMARY = {
  subtotal: "₺0,00",
  vat: "₺0,00",
  grand: "₺0,00"
} as const;

export const TSYF_SALES_LINK = {
  label: "Satış Bağlantısı",
  placeholder: "Satış bağlantısı seçin...",
  hint: "Sevkiyat, teklif veya sipariş ile ilişkilendirin."
} as const;

export const TSYF_ACTIONS = {
  cancel: "İptal",
  submit: "Teslimatı Oluştur"
} as const;

