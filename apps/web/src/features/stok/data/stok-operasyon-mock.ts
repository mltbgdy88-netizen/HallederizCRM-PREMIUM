// @ts-nocheck
export type StokKpi = {
  id: string;
  label: string;
  value: string;
  tone: "green" | "gold" | "teal" | "blue" | "slate" | "orange";
};

export type StokFilterOption = {
  label: string;
  value: string;
};

export type StokTableRow = {
  id: string;
  code: string;
  name: string;
  centerStock: string;
  factoryStock: string;
  depotRaf: string;
  depotRafSub: string;
  price: string;
  status: "Stokta" | "Kritik";
};

export type StokContextDetail = {
  productId: string;
  code: string;
  name: string;
  status: "Stokta" | "Kritik";
  barcode: string;
  brand: string;
  category: string;
  price: string;
  priceGroup: string;
  unit: string;
  factoryAlertTitle: string;
  factoryAlertDetail: string;
  depotAlertTitle: string;
  depotAlertDetail: string;
  summary: { label: string; value: string }[];
  depotInfo: { label: string; value: string }[];
  capacityCurrent: string;
  capacityMax: string;
  capacityPct: number;
};

export const SOM_TITLE = "Stok Operasyon Masası";
export const SOM_SUBTITLE =
  "Merkez, fabrika, depo ve raf bazında stok yönetimi ve operasyon ekranı.";

export const SOM_KPIS: StokKpi[] = [
  { id: "total", label: "Toplam Ürün", value: "2.458", tone: "green" },
  { id: "critical", label: "Kritik Stok", value: "86", tone: "orange" },
  { id: "center", label: "Merkez Stok", value: "125.430 adet", tone: "teal" },
  { id: "factory", label: "Fabrika Stok", value: "98.210 adet", tone: "blue" },
  { id: "shelf", label: "Depo Raf", value: "76.880 adet", tone: "slate" },
  { id: "price", label: "Fiyat Grubu", value: "12", tone: "gold" }
];

export const SOM_FILTER_SEARCH_PLACEHOLDER = "Ürün ara (kod, ad, barkod)...";

export const SOM_FILTERS: { id: string; label: string; options: StokFilterOption[] }[] = [
  { id: "brand", label: "Marka", options: [{ label: "Tümü", value: "all" }] },
  { id: "factory", label: "Fabrika", options: [{ label: "Tümü", value: "all" }] },
  { id: "depot", label: "Depo", options: [{ label: "Tümü", value: "all" }] },
  { id: "category", label: "Kategori", options: [{ label: "Tümü", value: "all" }] },
  { id: "status", label: "Durum", options: [{ label: "Tümü", value: "all" }] }
];

export const SOM_DEMO_BANNER =
  "Demo Verisi: Bu ekran demo amaçlıdır. Gerçek veriler farklılık gösterebilir.";

export const SOM_TABLE_ROWS: StokTableRow[] = [
  {
    id: "1",
    code: "UR-10001",
    name: "Rulman 6205 2RS",
    centerStock: "2.450",
    factoryStock: "1.250",
    depotRaf: "850",
    depotRafSub: "A-01-01",
    price: "₺85,00",
    status: "Stokta"
  },
  {
    id: "2",
    code: "UR-10018",
    name: "V Kayış B-68",
    centerStock: "1.120",
    factoryStock: "640",
    depotRaf: "420",
    depotRafSub: "B-02-04",
    price: "₺124,50",
    status: "Stokta"
  },
  {
    id: "3",
    code: "UR-10042",
    name: "Conta Seti 42 mm",
    centerStock: "86",
    factoryStock: "42",
    depotRaf: "28",
    depotRafSub: "C-01-08",
    price: "₺46,00",
    status: "Kritik"
  },
  {
    id: "4",
    code: "UR-10055",
    name: "Yağlama Spreyi 400 ml",
    centerStock: "540",
    factoryStock: "310",
    depotRaf: "190",
    depotRafSub: "A-03-02",
    price: "₺92,00",
    status: "Stokta"
  },
  {
    id: "5",
    code: "UR-10102",
    name: "Hidrolik Hortum 1/2\"",
    centerStock: "320",
    factoryStock: "180",
    depotRaf: "96",
    depotRafSub: "D-04-01",
    price: "₺210,00",
    status: "Stokta"
  },
  {
    id: "6",
    code: "UR-10128",
    name: "Filtre Kartuş FC-128",
    centerStock: "64",
    factoryStock: "38",
    depotRaf: "22",
    depotRafSub: "B-01-06",
    price: "₺158,00",
    status: "Kritik"
  },
  {
    id: "7",
    code: "UR-10164",
    name: "Zincir 08B-1",
    centerStock: "780",
    factoryStock: "420",
    depotRaf: "260",
    depotRafSub: "A-02-11",
    price: "₺68,50",
    status: "Stokta"
  },
  {
    id: "8",
    code: "UR-10201",
    name: "Redüktör Yağı 20W-50",
    centerStock: "210",
    factoryStock: "140",
    depotRaf: "88",
    depotRafSub: "C-03-03",
    price: "₺175,00",
    status: "Stokta"
  }
];

export const SOM_TABLE_TOTAL = "Toplam 2.458 kayıt";
export const SOM_PAGE_SIZE_LABEL = "10 satır";
export const SOM_PAGE_NUMBERS = ["1", "2", "3", "…", "246"] as const;

export const SOM_CONTEXT_BY_ROW: Record<string, StokContextDetail> = {
  "1": {
    productId: "1",
    code: "UR-10001",
    name: "Rulman 6205 2RS",
    status: "Stokta",
    barcode: "8680001100001",
    brand: "SKF",
    category: "Rulman · Endüstriyel",
    price: "₺85,00",
    priceGroup: "Liste",
    unit: "Adet",
    factoryAlertTitle: "Fabrika Stok Seviyesi Düşük",
    factoryAlertDetail: "Minimum: 1.000 | Mevcut: 1.250",
    depotAlertTitle: "Depo Raf Kapasite",
    depotAlertDetail: "Kullanım Oranı: %68",
    summary: [
      { label: "Merkez Stok", value: "2.450" },
      { label: "Fabrika Stok", value: "1.250" },
      { label: "Depo Raf", value: "850" },
      { label: "Rezerve", value: "120" },
      { label: "Kullanılabilir", value: "2.330" }
    ],
    depotInfo: [
      { label: "Depo", value: "Merkez Depo" },
      { label: "Raf Kodu", value: "A-01-01" },
      { label: "Raf Tipi", value: "Standart" }
    ],
    capacityCurrent: "1.250",
    capacityMax: "1.860 adet",
    capacityPct: 68
  },
  "2": {
    productId: "2",
    code: "UR-10018",
    name: "V Kayış B-68",
    status: "Stokta",
    barcode: "8680001100018",
    brand: "Gates",
    category: "Kayış · Transmisyon",
    price: "₺124,50",
    priceGroup: "Liste, Bayi",
    unit: "Adet",
    factoryAlertTitle: "Fabrika Stok Seviyesi Düşük",
    factoryAlertDetail: "Minimum: 500 | Mevcut: 640",
    depotAlertTitle: "Depo Raf Kapasite",
    depotAlertDetail: "Kullanım Oranı: %54",
    summary: [
      { label: "Merkez Stok", value: "1.120" },
      { label: "Fabrika Stok", value: "640" },
      { label: "Depo Raf", value: "420" },
      { label: "Rezerve", value: "48" },
      { label: "Kullanılabilir", value: "1.072" }
    ],
    depotInfo: [
      { label: "Depo", value: "Merkez Depo" },
      { label: "Raf Kodu", value: "B-02-04" },
      { label: "Raf Tipi", value: "Standart" }
    ],
    capacityCurrent: "420",
    capacityMax: "780 adet",
    capacityPct: 54
  },
  "3": {
    productId: "3",
    code: "UR-10042",
    name: "Conta Seti 42 mm",
    status: "Kritik",
    barcode: "8680001100042",
    brand: "SealPro",
    category: "Conta · Hidrolik",
    price: "₺46,00",
    priceGroup: "Liste",
    unit: "Adet",
    factoryAlertTitle: "Fabrika Stok Seviyesi Düşük",
    factoryAlertDetail: "Minimum: 80 | Mevcut: 42",
    depotAlertTitle: "Depo Raf Kapasite",
    depotAlertDetail: "Kullanım Oranı: %72",
    summary: [
      { label: "Merkez Stok", value: "86" },
      { label: "Fabrika Stok", value: "42" },
      { label: "Depo Raf", value: "28" },
      { label: "Rezerve", value: "6" },
      { label: "Kullanılabilir", value: "80" }
    ],
    depotInfo: [
      { label: "Depo", value: "Merkez Depo" },
      { label: "Raf Kodu", value: "C-01-08" },
      { label: "Raf Tipi", value: "Kritik Raf" }
    ],
    capacityCurrent: "28",
    capacityMax: "120 adet",
    capacityPct: 72
  }
};

export function getSomContext(rowId: string): StokContextDetail {
  return SOM_CONTEXT_BY_ROW[rowId] ?? SOM_CONTEXT_BY_ROW["1"]!;
}

