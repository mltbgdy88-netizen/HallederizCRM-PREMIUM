// @ts-nocheck
export const TSDM_PAGE = {
  breadcrumb: ["Teslimatlar", "Teslimat Detay"],
  title: "Teslimat TSL-441",
  subtitle: "Siparişe istinaden hazırlanmış teslimat kaydı."
} as const;

export const TSDM_STATUS_CARDS = [
  { id: "status", label: "Teslimat Durumu", value: "Tamamlandı", tone: "success" as const },
  { id: "driver", label: "Sürücü", value: "Mehmet Yılmaz" },
  { id: "vehicle", label: "Araç", value: "34 ABC 123" },
  { id: "depart", label: "Çıkış Tarihi", value: "22.05.2025 08:30" },
  { id: "delivered", label: "Teslim Tarihi", value: "22.05.2025 12:45" },
  { id: "customer", label: "Müşteri", value: "ABC İnşaat A.Ş." }
] as const;

export const TSDM_METRICS = [
  { label: "Toplam Kalem", value: "8" },
  { label: "Toplam Ürün", value: "68" },
  { label: "Toplam Miktar", value: "2.458" },
  { label: "Toplam Ağırlık", value: "1.860,00 kg" },
  { label: "Toplam Hacim", value: "2,34 m³" }
] as const;

export const TSDM_LINES = [
  { id: "1", code: "UR-10001", name: "Rulman 6205 2RS", qty: "12", unit: "Adet", price: "₺185,00", total: "₺2.220,00" },
  { id: "2", code: "UR-10006", name: "V Kayışı SPB 1600", qty: "8", unit: "Adet", price: "₺95,00", total: "₺760,00" },
  { id: "3", code: "UR-10012", name: "Elektrik Motoru 7.5 kW", qty: "4", unit: "Adet", price: "₺2.450,00", total: "₺9.800,00" },
  { id: "4", code: "UR-10018", name: "Hidrolik Hortum 3/8", qty: "20", unit: "Metre", price: "₺42,00", total: "₺840,00" },
  { id: "5", code: "UR-10022", name: "Conta Seti DN50", qty: "6", unit: "Adet", price: "₺120,00", total: "₺720,00" },
  { id: "6", code: "UR-10025", name: "Redüktör 1:20", qty: "2", unit: "Adet", price: "₺3.200,00", total: "₺6.400,00" },
  { id: "7", code: "UR-10030", name: "Yağ Filtresi HF-204", qty: "10", unit: "Adet", price: "₺68,00", total: "₺680,00" },
  { id: "8", code: "UR-10035", name: "Kontrol Paneli KP-12", qty: "6", unit: "Adet", price: "₺70,00", total: "₺420,00" }
] as const;

export const TSDM_LINE_FOOT = {
  qty: "68",
  total: "₺19.840,00"
} as const;

export const TSDM_NOTE =
  "Saha teslimi sorunsuz tamamlandı. Müşteri yetkilisi teslimatı eksiksiz olarak kabul etmiştir.";

export const TSDM_CONTEXT = {
  title: "Teslimat Bağlamı",
  rows: [
    { label: "Sipariş", value: "SP-705", link: true },
    { label: "Cari", value: "ABC İnşaat A.Ş." },
    { label: "Adres", value: "Horozluhan Mah. Atatürk Bulvarı No:45 Karatay / Konya", full: true },
    { label: "Sevkiyat", value: "SVK-332" },
    { label: "Depo", value: "Merkez Depo" },
    { label: "Ödeme Tipi", value: "Peşin" },
    { label: "Oluşturulma", value: "21.05.2025 14:20" }
  ]
} as const;

export const TSDM_PROOF = {
  receiver: "Ahmet Demir",
  receiverRole: "ABC İnşaat A.Ş. / Şantiye Şefi",
  signatureLabel: "İmza",
  photosLabel: "Teslimat Fotoğrafları",
  photoCount: "+2"
} as const;

export const TSDM_ACTIONS = [
  "Teslimatı İptal Et",
  "İrsaliye Yazdır",
  "Yeni Teslimat Oluştur"
] as const;
