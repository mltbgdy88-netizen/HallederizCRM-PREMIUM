// @ts-nocheck
export type DhmKpiTone = "orange" | "green" | "red" | "teal" | "gold";

export type DhmKpi = {
  id: string;
  label: string;
  value: string;
  tone: DhmKpiTone;
};

export type DhmStatus = "Bekleyen" | "Eksik" | "Hazırlanan";

export type DhmTableRow = {
  id: string;
  docNo: string;
  docDate: string;
  customer: string;
  customerCode: string;
  status: DhmStatus;
  shelf: string;
  primaryAction: string;
};

export type DhmContext = {
  rowId: string;
  docNo: string;
  docMeta: string;
  status: DhmStatus;
  customer: string;
  customerCode: string;
  warehouse: string;
  shipDate: string;
  shelf: string;
  shelfZone: string;
  capacityUsed: number;
  capacityMax: number;
  capacityPct: number;
};

export const DHM_TITLE = "Depo Hazırlık Operasyon Masası";
export const DHM_SUBTITLE =
  "Bekleyen hazırlık fişlerini toplayın, eksikleri yönetin ve sevkiyata hazırlayın.";

export const DHM_KPIS: DhmKpi[] = [
  { id: "waiting", label: "Bekleyen", value: "36", tone: "orange" },
  { id: "preparing", label: "Hazırlanan", value: "24", tone: "green" },
  { id: "missing", label: "Eksik", value: "8", tone: "red" },
  { id: "today", label: "Bugün", value: "12", tone: "teal" },
  { id: "roll", label: "Rulo", value: "5", tone: "gold" }
];

export const DHM_TABS = ["Bekleyenler", "Hazırlananlar"] as const;

export const DHM_FILTER_SEARCH = "Belge No, Cari, Ürün ara...";

export const DHM_FILTERS = [
  { id: "depot", label: "Depo", options: [{ label: "Tümü", value: "all" }] },
  { id: "shelf", label: "Raf", options: [{ label: "Tümü", value: "all" }] },
  { id: "status", label: "Durum", options: [{ label: "Tümü", value: "all" }] },
  { id: "date", label: "Tarih", options: [{ label: "Tümü", value: "all" }] }
];

export const DHM_TABLE_ROWS: DhmTableRow[] = [
  {
    id: "1",
    docNo: "HZR-2025-00036",
    docDate: "15.05.2025",
    customer: "ABC Tekstil A.Ş.",
    customerCode: "120.001",
    status: "Bekleyen",
    shelf: "A-01-01",
    primaryAction: "Topla"
  },
  {
    id: "2",
    docNo: "HZR-2025-00035",
    docDate: "15.05.2025",
    customer: "Demir Çelik Tic. Ltd. Şti.",
    customerCode: "120.015",
    status: "Eksik",
    shelf: "B-02-04",
    primaryAction: "Kontrol Et"
  },
  {
    id: "3",
    docNo: "HZR-2025-00034",
    docDate: "14.05.2025",
    customer: "Akdeniz Gıda A.Ş.",
    customerCode: "120.028",
    status: "Hazırlanan",
    shelf: "C-01-08",
    primaryAction: "Sevke Hazır"
  },
  {
    id: "4",
    docNo: "HZR-2025-00033",
    docDate: "14.05.2025",
    customer: "Ege Mobilya Sanayi Ltd. Şti.",
    customerCode: "120.042",
    status: "Bekleyen",
    shelf: "A-03-02",
    primaryAction: "Topla"
  },
  {
    id: "5",
    docNo: "HZR-2025-00032",
    docDate: "13.05.2025",
    customer: "Marmara Lojistik A.Ş.",
    customerCode: "120.056",
    status: "Hazırlanan",
    shelf: "D-04-01",
    primaryAction: "Sevke Hazır"
  },
  {
    id: "6",
    docNo: "HZR-2025-00031",
    docDate: "13.05.2025",
    customer: "Karadeniz Yapı Malz. Ltd.",
    customerCode: "120.061",
    status: "Eksik",
    shelf: "B-01-06",
    primaryAction: "Kontrol Et"
  },
  {
    id: "7",
    docNo: "HZR-2025-00030",
    docDate: "12.05.2025",
    customer: "Anadolu Kimya San. A.Ş.",
    customerCode: "120.073",
    status: "Bekleyen",
    shelf: "A-02-11",
    primaryAction: "Topla"
  },
  {
    id: "8",
    docNo: "HZR-2025-00029",
    docDate: "12.05.2025",
    customer: "İstanbul Elektrik Tic. Ltd.",
    customerCode: "120.088",
    status: "Hazırlanan",
    shelf: "C-03-03",
    primaryAction: "Sevke Hazır"
  }
];

export const DHM_TABLE_TOTAL = "Toplam 36 kayıt";
export const DHM_PAGE_NUMBERS = ["1", "2", "3", "4", "…"];

const CONTEXTS: Record<string, DhmContext> = {
  "1": {
    rowId: "1",
    docNo: "HZR-2025-00036",
    docMeta: "15.05.2025 · 09:24",
    status: "Bekleyen",
    customer: "ABC Tekstil A.Ş.",
    customerCode: "120.001",
    warehouse: "Merkez Depo",
    shipDate: "15.05.2025",
    shelf: "A-01-01",
    shelfZone: "Bölge A Bölgesi",
    capacityUsed: 68,
    capacityMax: 100,
    capacityPct: 68
  }
};

export function getDhmContext(rowId: string): DhmContext {
  return CONTEXTS[rowId] ?? CONTEXTS["1"];
}
