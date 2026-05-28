// @ts-nocheck
export type FstKpiTone = "green" | "gold" | "teal" | "blue" | "slate" | "orange";

export type FstKpi = { id: string; label: string; value: string; tone: FstKpiTone };

export type FstIntegrationStatus = "Başarılı" | "Uyarı" | "Hata";

export type FstTableRow = {
  id: string;
  code: string;
  name: string;
  factoryQty: string;
  syncQty: string;
  syncPct: string;
  integration: FstIntegrationStatus;
  lastSync: string;
};

export const FST_TITLE = "Fabrika Operasyon Masası";
export const FST_SUBTITLE =
  "Fabrika stoklarınızın senkronizasyon, entegrasyon ve operasyon yönetimi.";

export const FST_KPIS: FstKpi[] = [
  { id: "total", label: "Toplam Ürün", value: "2.458", tone: "green" },
  { id: "warn", label: "Senkron Uyarı", value: "86", tone: "orange" },
  { id: "current", label: "Toplam Mevcut", value: "125.430", tone: "teal" },
  { id: "integrated", label: "Entegre Ürün", value: "98.210", tone: "blue" },
  { id: "success", label: "Entegrasyon Başarılı", value: "76.880", tone: "slate" },
  { id: "error", label: "Entegrasyon Hatası", value: "12", tone: "gold" }
];

export const FST_WARN_BANNER =
  "86 ürün için senkronizasyon uyarısı bulunmaktadır. Detayları görmek için tabloyu inceleyiniz.";

export const FST_FILTER_SEARCH = "Ürün Kodu, adı veya barkod...";

export const FST_FILTERS = [
  { id: "factory", label: "Fabrika", options: [{ label: "Tümü", value: "all" }] },
  { id: "depot", label: "Depo", options: [{ label: "Tümü", value: "all" }] },
  { id: "integration", label: "Entegrasyon Durumu", options: [{ label: "Tümü", value: "all" }] },
  { id: "sync", label: "Senkron Durumu", options: [{ label: "Tümü", value: "all" }] }
];

export const FST_TABLE_ROWS: FstTableRow[] = [
  {
    id: "1",
    code: "UR-10001",
    name: "Rulman 6205 2RS",
    factoryQty: "2.450",
    syncQty: "2.430",
    syncPct: "%99",
    integration: "Başarılı",
    lastSync: "Son: 2 dk önce"
  },
  {
    id: "2",
    code: "UR-10018",
    name: "V Kayış B-68",
    factoryQty: "1.120",
    syncQty: "1.105",
    syncPct: "%99",
    integration: "Başarılı",
    lastSync: "Son: 5 dk önce"
  },
  {
    id: "3",
    code: "UR-10042",
    name: "Conta Seti 42 mm",
    factoryQty: "86",
    syncQty: "72",
    syncPct: "%84",
    integration: "Uyarı",
    lastSync: "Son: 12 dk önce"
  },
  {
    id: "4",
    code: "UR-10055",
    name: "Yağlama Spreyi 400 ml",
    factoryQty: "540",
    syncQty: "538",
    syncPct: "%100",
    integration: "Başarılı",
    lastSync: "Son: 3 dk önce"
  },
  {
    id: "5",
    code: "UR-10102",
    name: "Hidrolik Hortum 1/2\"",
    factoryQty: "320",
    syncQty: "0",
    syncPct: "%0",
    integration: "Hata",
    lastSync: "Son: 45 dk önce"
  },
  {
    id: "6",
    code: "UR-10128",
    name: "Filtre Kartuş FC-128",
    factoryQty: "64",
    syncQty: "58",
    syncPct: "%91",
    integration: "Uyarı",
    lastSync: "Son: 18 dk önce"
  }
];

export const FST_TABLE_TOTAL = "Toplam 2.458 kayıt";
export const FST_PAGE_NUMBERS = ["1", "2", "3", "…", "246"];

export const FST_CONTEXT = {
  factory: "A-01 Merkez Fabrika",
  status: "Aktif",
  source: "ERP - Fabrika Sistemi",
  lastSync: "20.05.2025 15:28",
  nextSync: "20.05.2025 15:38",
  healthPct: 94,
  health: [
    { label: "Başarılı", value: "76.880", tone: "green" },
    { label: "Uyarı", value: "86", tone: "gold" },
    { label: "Hata", value: "12", tone: "red" }
  ],
  quickActions: [
    "Senkronizasyonu Başlat",
    "Eşleşmeyenleri Göster",
    "Entegrasyon Raporu",
    "Bağlantıyı Test Et"
  ],
  infoNote: "Senkronizasyon her 10 dakikada bir otomatik olarak çalışır."
};

export function fstIntegrationClass(status: FstIntegrationStatus): string {
  if (status === "Başarılı") return " fst-badge--ok";
  if (status === "Uyarı") return " fst-badge--warn";
  return " fst-badge--err";
}

