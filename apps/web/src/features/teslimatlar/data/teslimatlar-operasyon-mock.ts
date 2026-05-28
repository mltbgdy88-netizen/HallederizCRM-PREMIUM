// @ts-nocheck
export type TeslimatKpi = {
  id: string;
  label: string;
  value: string;
  tone: "green" | "gold" | "teal" | "blue" | "orange";
};

export type TeslimatFilterOption = {
  label: string;
  value: string;
};

export type TeslimatStatus = "Yolda" | "Planlanan" | "Tamamlandı" | "Geciken";

export type TeslimatTableRow = {
  id: string;
  deliveryNo: string;
  customer: string;
  status: TeslimatStatus;
  document: string;
};

export type TeslimatContextDetail = {
  rowId: string;
  deliveryNo: string;
  customer: string;
  status: TeslimatStatus;
  deliveryDate: string;
  plannedTime: string;
  location: string;
  driver: string;
  plate: string;
  documentId: string;
  signatureWarning: string;
  maintenanceWarning: string;
  totalItems: string;
  totalQuantity: string;
  delivered: string;
  remaining: string;
  damaged: string;
  note: string;
};

export const TSM_TITLE = "Teslimatlar Operasyon Masası";
export const TSM_SUBTITLE =
  "Merkez, fabrika, depo ve raf bazında teslimat süreçlerinizi yönetin ve izleyin.";

export const TSM_KPIS: TeslimatKpi[] = [
  { id: "total", label: "Toplam Teslimat", value: "1.248", tone: "green" },
  { id: "planned", label: "Planlanan", value: "156", tone: "gold" },
  { id: "completed", label: "Tamamlanan", value: "892", tone: "teal" },
  { id: "onway", label: "Yolda", value: "128", tone: "blue" },
  { id: "delayed", label: "Geciken", value: "72", tone: "orange" }
];

export const TSM_FILTER_SEARCH_PLACEHOLDER = "Teslim no, müşteri, belge...";

export const TSM_FILTERS: { id: string; label: string; options: TeslimatFilterOption[] }[] = [
  { id: "date", label: "Tarih Aralığı", options: [{ label: "Bu Ay", value: "month" }] },
  { id: "customer", label: "Müşteri", options: [{ label: "Tümü", value: "all" }] },
  { id: "warehouse", label: "Depo", options: [{ label: "Tümü", value: "all" }] },
  { id: "status", label: "Durum", options: [{ label: "Tümü", value: "all" }] }
];

export const TSM_TABLE_ROWS: TeslimatTableRow[] = [
  {
    id: "1",
    deliveryNo: "TES-10001",
    customer: "ABC İnşaat San. ve Tic. A.Ş.",
    status: "Yolda",
    document: "IRS-2025-10001"
  },
  {
    id: "2",
    deliveryNo: "TES-10002",
    customer: "Delta Makina Ltd. Şti.",
    status: "Planlanan",
    document: "IRS-2025-10002"
  },
  {
    id: "3",
    deliveryNo: "TES-10003",
    customer: "Ege Yapı Malzemeleri A.Ş.",
    status: "Tamamlandı",
    document: "IRS-2025-10003"
  },
  {
    id: "4",
    deliveryNo: "TES-10004",
    customer: "Kuzey Gıda San. Tic. A.Ş.",
    status: "Geciken",
    document: "IRS-2025-10004"
  },
  {
    id: "5",
    deliveryNo: "TES-10005",
    customer: "Marmara Lojistik A.Ş.",
    status: "Yolda",
    document: "IRS-2025-10005"
  },
  {
    id: "6",
    deliveryNo: "TES-10006",
    customer: "Anadolu Tekstil Ltd. Şti.",
    status: "Tamamlandı",
    document: "IRS-2025-10006"
  },
  {
    id: "7",
    deliveryNo: "TES-10007",
    customer: "Güney Otomotiv San. Tic. A.Ş.",
    status: "Planlanan",
    document: "IRS-2025-10007"
  },
  {
    id: "8",
    deliveryNo: "TES-10008",
    customer: "Karadeniz İnşaat A.Ş.",
    status: "Yolda",
    document: "IRS-2025-10008"
  }
];

export const TSM_TABLE_TOTAL = "Toplam 1.248 kayıt";
export const TSM_PAGE_NUMBERS = ["1", "2", "3", "…", "125"] as const;

export const TSM_CONTEXT_BY_ROW: Record<string, TeslimatContextDetail> = {
  "1": {
    rowId: "1",
    deliveryNo: "TES-10001",
    customer: "ABC İnşaat San. ve Tic. A.Ş.",
    status: "Yolda",
    deliveryDate: "15.05.2025",
    plannedTime: "10:00",
    location: "İstanbul / Ataşehir",
    driver: "Mehmet Yıldız",
    plate: "34 ABC 123",
    documentId: "IRS-2025-10001",
    signatureWarning: "IRS-2025-10001 belgesi için imza bekleniyor.",
    maintenanceWarning: "Araç bakım süresi 3 gün içinde doluyor.",
    totalItems: "8",
    totalQuantity: "1.250",
    delivered: "650",
    remaining: "600",
    damaged: "0",
    note: "Site güvenliğine haber verildi."
  }
};

export function getTsmContext(rowId: string): TeslimatContextDetail {
  return TSM_CONTEXT_BY_ROW[rowId] ?? TSM_CONTEXT_BY_ROW["1"]!;
}
