// @ts-nocheck
export type DfdLine = {
  id: string;
  index: number;
  productCode: string;
  productName: string;
  shelf: string;
  floor: string;
  capacityUsed: string;
  capacityMax: string;
  capacityPct: string;
  toCollect: string;
  collected: string;
  unit: string;
  status: string;
};

export const DFD_PAGE = {
  title: "Depo Fişi",
  slipId: "DF-771",
  badges: ["Onaylandı", "Çıkış Fişi"] as const,
  breadcrumb: ["Depo Yönetimi", "Depo Fişleri", "DF-771"],
  createdBy: "Yusuf Kaya",
  createdAt: "02.05.2025 14:32"
};

export const DFD_META = [
  { label: "Fiş No", value: "DF-771" },
  { label: "Tarih", value: "02.05.2025 14:32" },
  { label: "Depo", value: "Merkez Depo" },
  { label: "İşlem Türü", value: "Depodan Çıkış" },
  { label: "Kaynak", value: "Satış Siparişi" },
  { label: "İlgili Belge", value: "SS-5689" },
  { label: "Açıklama", value: "Blue Com Bilgi İşlem A.�?. sevkiyatı" }
];

export const DFD_LINES: DfdLine[] = [
  {
    id: "1",
    index: 1,
    productCode: "UR-10001",
    productName: "Rulman 6205 2RS",
    shelf: "A-01-01",
    floor: "1. Kat",
    capacityUsed: "850",
    capacityMax: "1.250",
    capacityPct: "%68",
    toCollect: "2.450",
    collected: "2.450",
    unit: "Adet",
    status: "Tamamlandı"
  },
  {
    id: "2",
    index: 2,
    productCode: "UR-10006",
    productName: "Hidrolik Yağ 46 20L",
    shelf: "A-01-02",
    floor: "1. Kat",
    capacityUsed: "420",
    capacityMax: "800",
    capacityPct: "%53",
    toCollect: "120",
    collected: "120",
    unit: "Adet",
    status: "Tamamlandı"
  },
  {
    id: "3",
    index: 3,
    productCode: "UR-10008",
    productName: "Endüstriyel Sensör Seti",
    shelf: "B-02-01",
    floor: "2. Kat",
    capacityUsed: "190",
    capacityMax: "500",
    capacityPct: "%38",
    toCollect: "48",
    collected: "48",
    unit: "Adet",
    status: "Tamamlandı"
  },
  {
    id: "4",
    index: 4,
    productCode: "UR-10012",
    productName: "Kontrol Paneli KP-200",
    shelf: "B-02-04",
    floor: "2. Kat",
    capacityUsed: "96",
    capacityMax: "320",
    capacityPct: "%30",
    toCollect: "12",
    collected: "12",
    unit: "Adet",
    status: "Tamamlandı"
  },
  {
    id: "5",
    index: 5,
    productCode: "UR-10015",
    productName: "Bağlantı Kablosu 5m",
    shelf: "C-01-08",
    floor: "1. Kat",
    capacityUsed: "260",
    capacityMax: "600",
    capacityPct: "%43",
    toCollect: "1.165",
    collected: "1.165",
    unit: "Adet",
    status: "Tamamlandı"
  },
  {
    id: "6",
    index: 6,
    productCode: "UR-10018",
    productName: "Pnömatik Valf PV-12",
    shelf: "C-03-03",
    floor: "3. Kat",
    capacityUsed: "88",
    capacityMax: "200",
    capacityPct: "%44",
    toCollect: "1.000",
    collected: "1.000",
    unit: "Adet",
    status: "Tamamlandı"
  }
];

export const DFD_LINE_TOTALS = { records: "6", toCollect: "4.795", collected: "4.795" };

export const DFD_SUMMARY = [
  { label: "Toplam Satır", value: "6" },
  { label: "Toplam Toplanacak", value: "4.795" },
  { label: "Toplam Toplanan", value: "4.795" },
  { label: "Toplama Oranı", value: "%100" },
  { label: "Toplam Ağırlık", value: "286,40 kg" },
  { label: "Toplam Hacim", value: "0,85 m³" }
];

export const DFD_HISTORY = [
  { title: "Fiş Oluşturuldu", user: "Yusuf Kaya", time: "02.05.2025 14:32" },
  { title: "Toplama Başlatıldı", user: "Ahmet Demir", time: "02.05.2025 14:45" },
  { title: "Toplama Tamamlandı", user: "Ahmet Demir", time: "02.05.2025 15:20" },
  { title: "Fiş Onaylandı", user: "Yusuf Kaya", time: "02.05.2025 15:35" }
];

export const DFD_NOTES =
  "Blue Com Bilgi İşlem A.�?. sevkiyatı için hazırlanan çıkış fişi. Tüm satırlar toplandı ve onaylandı.";

export const DFD_CONTEXT = {
  title: "Depo Bağlamı",
  capacity: [
    { label: "Alan", used: "68%", detail: "680 / 1.000 m²" },
    { label: "Hacim", used: "54%", detail: "540 / 1.000 m³" },
    { label: "Ağırlık", used: "72%", detail: "7.200 / 10.000 kg" }
  ],
  warnings: [
    { tone: "warn" as const, text: "A-01-01 rafı kapasite sınırına yaklaşıyor (%68)." },
    { tone: "danger" as const, text: "B-02-01 rafında yalnızca 20 kg boş alan kaldı." }
  ],
  relatedDocs: [
    { label: "Satış Siparişi", value: "SS-5689" },
    { label: "Sevkiyat Planı", value: "SP-1258" },
    { label: "Fatura Taslağı", value: "FT-3698" }
  ],
  quickActions: ["Transfer Talebi Oluştur", "İade Fişi Oluştur", "Etiket Yazdır"],
  barcodeActions: ["Toplama Barkodu", "Raf Barkodu"]
};

