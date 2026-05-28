// @ts-nocheck
export type HsmLineRow = {
  id: string;
  code: string;
  product: string;
  unit: string;
  qty: string;
  source: string;
  warehouse: string;
  shelf: string;
  unitPrice: string;
  vat: string;
  total: string;
};

export type HsmSummaryRow = {
  label: string;
  value: string;
  highlight?: boolean;
};

export const HSM_TITLE = "Hızlı Satış Masası";
export const HSM_SUBTITLE = "Tek ekrandan satış, teklif ve tahsilat hazırlığı";

export const HSM_HEADER_ACTIONS = [
  { id: "offer", label: "Tekliften Çağır", icon: "offer" as const },
  { id: "new", label: "+ Yeni Fiş", icon: "plus" as const },
  { id: "preview", label: "Önizle", icon: "eye" as const }
];

export const HSM_FORM = {
  customerLabel: "Cari / Müşteri",
  customerPlaceholder: "Cari veya müşteri ara…",
  newCustomerLink: "+ Yeni Cari Ekle",
  phoneLabel: "Telefon",
  phoneValue: "0532 123 45 67",
  repLabel: "Satış Temsilcisi",
  repValue: "Demo Kullanıcı",
  warehouseLabel: "Depo",
  warehouseValue: "Merkez Depo"
};

export const HSM_INFO_BANNERS = [
  "Ürün yok + ödeme doluysa tahsilat olarak işlenir.",
  "Tekliften çağrılan fiş satışa dönüşebilir."
];

export const HSM_LINES: HsmLineRow[] = [
  {
    id: "1",
    code: "PRD-00123",
    product: "Beyaz A4 Kağıt 80 gr",
    unit: "Pak",
    qty: "10",
    source: "Stok",
    warehouse: "Merkez Depo",
    shelf: "A-01-02",
    unitPrice: "125,00",
    vat: "%20",
    total: "1.250,00"
  },
  {
    id: "2",
    code: "PRD-00245",
    product: "Tükenmez Kalem Mavi",
    unit: "Adet",
    qty: "50",
    source: "Stok",
    warehouse: "Merkez Depo",
    shelf: "B-02-03",
    unitPrice: "12,00",
    vat: "%20",
    total: "600,00"
  },
  {
    id: "3",
    code: "PRD-00456",
    product: "Dosya Klasör Dar",
    unit: "Adet",
    qty: "25",
    source: "Stok",
    warehouse: "Merkez Depo",
    shelf: "B-01-04",
    unitPrice: "18,00",
    vat: "%20",
    total: "450,00"
  },
  {
    id: "4",
    code: "PRD-00789",
    product: "Zımba Makinesi No:24/6",
    unit: "Adet",
    qty: "5",
    source: "Stok",
    warehouse: "Merkez Depo",
    shelf: "C-01-01",
    unitPrice: "185,00",
    vat: "%20",
    total: "925,00"
  },
  {
    id: "5",
    code: "PRD-00987",
    product: "A4 Şeffaf Poşet 100'lü",
    unit: "Pak",
    qty: "10",
    source: "Stok",
    warehouse: "Merkez Depo",
    shelf: "A-03-01",
    unitPrice: "35,00",
    vat: "%20",
    total: "350,00"
  },
  {
    id: "6",
    code: "PRD-01111",
    product: "Yapışkanlı Not Kağıdı 75x75",
    unit: "Adet",
    qty: "20",
    source: "Stok",
    warehouse: "Merkez Depo",
    shelf: "B-03-02",
    unitPrice: "22,50",
    vat: "%20",
    total: "450,00"
  }
];

export const HSM_SUMMARY: HsmSummaryRow[] = [
  { label: "Ara Toplam", value: "4.025,00 TL" },
  { label: "Toplam İskonto", value: "0,00 TL" },
  { label: "KDV Matrahı", value: "4.025,00 TL" },
  { label: "KDV Toplamı", value: "805,00 TL" },
  { label: "Genel Toplam", value: "4.830,00 TL", highlight: true }
];

export const HSM_PAYMENT = {
  methodLabel: "Tahsilat Yöntemi",
  methodValue: "Havale",
  dueLabel: "Vade Tarihi",
  dueValue: "20.05.2025",
  amountLabel: "Tahsil Edilecek Tutar",
  amountValue: "4.830,00"
};

export const HSM_APPROVAL = {
  title: "Onay Durumu",
  statusLabel: "Durum:",
  statusValue: "Taslak",
  approverLabel: "Onaylayan:",
  approverValue: "--",
  dateLabel: "Onay Tarihi:",
  dateValue: "--"
};

export const HSM_DOC_ACTIONS = [
  { id: "doc", label: "Belge Önizle" },
  { id: "wa", label: "WhatsApp ile Gönder" }
];

export const HSM_FOOTER_ACTIONS = [
  { id: "cancel", label: "Vazgeç", icon: "cancel" as const, tone: "ghost" as const },
  { id: "sale", label: "Satış Kaydet", icon: "save" as const, tone: "primary" as const },
  { id: "offer", label: "Teklif Olarak Kaydet", icon: "doc" as const, tone: "primary" as const },
  { id: "collect", label: "Tahsilat Kaydet", icon: "wallet" as const, tone: "primary" as const },
  { id: "approve", label: "Onaya Gönder", icon: "send" as const, tone: "primary" as const }
];
