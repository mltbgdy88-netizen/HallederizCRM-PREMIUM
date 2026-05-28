// @ts-nocheck
export type BomKpiTone = "green" | "orange" | "slate" | "teal";

export type BomKpi = {
  id: string;
  label: string;
  value: string;
  tone: BomKpiTone;
};

export type BomDocStatus = "Yüklendi" | "Bekliyor" | "Arşivlendi";

export type BomTableRow = {
  id: string;
  docNo: string;
  type: string;
  customer: string;
  date: string;
  status: BomDocStatus;
};

export type BomContext = {
  rowId: string;
  fileName: string;
  fileSize: string;
  status: BomDocStatus;
  type: string;
  docNo: string;
  customer: string;
  date: string;
  uploader: string;
  description: string;
  tags: string[];
  history: { text: string; time: string }[];
};

export const BOM_TITLE = "Belgeler Operasyon Masası";
export const BOM_SUBTITLE =
  "Merkez, fabrika ve sahalardan gelen belgelerin yönetimi ve takibi.";

export const BOM_KPIS: BomKpi[] = [
  { id: "uploaded", label: "Yüklenen", value: "1.248", tone: "green" },
  { id: "pending", label: "Bekleyen", value: "153", tone: "orange" },
  { id: "archived", label: "Arşivlenen", value: "3.452", tone: "slate" },
  { id: "total", label: "Toplam Belge", value: "4.853", tone: "teal" }
];

export const BOM_FILTER_SEARCH = "Belge No, açıklama veya etiket ara...";

export const BOM_FILTERS = [
  { id: "type", label: "Tür", options: [{ label: "Tümü", value: "all" }] },
  { id: "date", label: "Tarih Aralığı", options: [{ label: "Son 30 Gün", value: "30d" }] },
  { id: "customer", label: "Cari", options: [{ label: "Tümü", value: "all" }] }
];

export const BOM_TABLE_ROWS: BomTableRow[] = [
  { id: "1", docNo: "BEL-2025-000124", type: "Fatura", customer: "ABC Otomotiv A.Ş.", date: "20.05.2025 14:35", status: "Yüklendi" },
  { id: "2", docNo: "BLG-2025-0123", type: "İrsaliye", customer: "Demir Çelik Tic. Ltd. Şti.", date: "14.05.2025", status: "Bekliyor" },
  { id: "3", docNo: "BLG-2025-0122", type: "Teklif", customer: "Akdeniz Gıda A.Ş.", date: "14.05.2025", status: "Yüklendi" },
  { id: "4", docNo: "BLG-2025-0121", type: "Sözleşme", customer: "Ege Mobilya Sanayi Ltd. Şti.", date: "13.05.2025", status: "Arşivlendi" },
  { id: "5", docNo: "BLG-2025-0120", type: "Sipariş", customer: "Marmara Lojistik A.Ş.", date: "13.05.2025", status: "Yüklendi" },
  { id: "6", docNo: "BLG-2025-0119", type: "Fatura", customer: "Karadeniz Yapı Malz. Ltd.", date: "12.05.2025", status: "Bekliyor" },
  { id: "7", docNo: "BLG-2025-0118", type: "İrsaliye", customer: "Anadolu Kimya San. A.Ş.", date: "12.05.2025", status: "Yüklendi" },
  { id: "8", docNo: "BLG-2025-0117", type: "Fatura", customer: "İstanbul Elektrik Tic. Ltd.", date: "11.05.2025", status: "Arşivlendi" }
];

export const BOM_TABLE_TOTAL = "Toplam 4.853 kayıt";
export const BOM_PAGE_NUMBERS = ["1", "2", "3", "…", "486"];

const CONTEXTS: Record<string, BomContext> = {
  "1": {
    rowId: "1",
    fileName: "FATURA_ABC_2025_000124.pdf",
    fileSize: "1.248 KB",
    status: "Yüklendi",
    type: "Fatura",
    docNo: "BEL-2025-000124",
    customer: "ABC Otomotiv A.Ş.",
    date: "20.05.2025 14:35",
    uploader: "Yusuf Kaya",
    description: "Mayıs 2025 faturası",
    tags: ["fatura", "mayıs", "2025"],
    history: [
      { text: "Yusuf Kaya tarafından yüklendi", time: "20.05.2025 14:35" },
      { text: "Dilara Şen tarafından incelendi", time: "20.05.2025 15:10" }
    ]
  }
};

export function getBomContext(rowId: string): BomContext {
  return CONTEXTS[rowId] ?? CONTEXTS["1"];
}
