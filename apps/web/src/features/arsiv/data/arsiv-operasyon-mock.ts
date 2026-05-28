// @ts-nocheck
export type ArsivKpi = {
  id: string;
  label: string;
  value: string;
  tone: "green" | "gold" | "teal" | "blue" | "slate" | "orange";
};

export type ArsivCategoryTab = {
  id: string;
  label: string;
};

export type ArsivFilterOption = {
  label: string;
  value: string;
};

export type ArsivRecordStatus = "Onaylı" | "Beklemede" | "Onay Bekliyor";

export type ArsivTableRow = {
  id: string;
  recordId: string;
  context: string;
  type: string;
  date: string;
  status: ArsivRecordStatus;
  responsible: string;
};

export type ArsivAuditEvent = {
  id: string;
  title: string;
  actor: string;
  time: string;
};

export type ArsivContextDetail = {
  recordId: string;
  type: string;
  context: string;
  date: string;
  status: ArsivRecordStatus;
  responsible: string;
  auditTrail: ArsivAuditEvent[];
  documentName: string;
  documentSize: string;
  documentType: string;
  documentPages: string;
  documentTags: string[];
};

export const AOM_TITLE = "Arşiv Operasyon Merkezi";
export const AOM_SUBTITLE = "gecmis islemler belgeler";

export const AOM_KPIS: ArsivKpi[] = [
  { id: "total", label: "Toplam Kayıt", value: "12.458", tone: "green" },
  { id: "today", label: "Bugün Eklenen", value: "86", tone: "teal" },
  { id: "approved", label: "Onaylı Belge", value: "9.847", tone: "blue" },
  { id: "pending", label: "Bekleyen İşlem", value: "237", tone: "gold" },
  { id: "risk", label: "Riskli Kayıt", value: "36", tone: "orange" },
  { id: "retention", label: "Saklama Süresi", value: "7,2 Yıl", tone: "slate" }
];

export const AOM_CATEGORY_TABS: ArsivCategoryTab[] = [
  { id: "all", label: "Tüm Kayıtlar" },
  { id: "order", label: "Sipariş" },
  { id: "collection", label: "Tahsilat" },
  { id: "delivery", label: "Teslimat" },
  { id: "return", label: "İade" },
  { id: "invoice", label: "Fatura" },
  { id: "document", label: "Belge" }
];

export const AOM_FILTER_SEARCH_PLACEHOLDER = "Arama";

export const AOM_FILTERS: { id: string; label: string; options: ArsivFilterOption[] }[] = [
  { id: "source", label: "Kaynak", options: [{ label: "Tümü", value: "all" }] },
  { id: "status", label: "Durum", options: [{ label: "Tümü", value: "all" }] },
  { id: "date", label: "Tarih", options: [{ label: "Tümü", value: "all" }] },
  { id: "user", label: "Kullanıcı", options: [{ label: "Tümü", value: "all" }] }
];

export const AOM_DEMO_BANNER = "Demo Modu: Veri seti örnek amaçlıdır.";

export const AOM_TABLE_ROWS: ArsivTableRow[] = [
  {
    id: "1",
    recordId: "AR-2025-000987",
    context: "ABC Ticaret A.Ş.",
    type: "Fatura",
    date: "16.05.2025 14:32",
    status: "Onaylı",
    responsible: "Yasin K."
  },
  {
    id: "2",
    recordId: "AR-2025-000986",
    context: "XYZ Lojistik Ltd.",
    type: "Sipariş",
    date: "16.05.2025 13:15",
    status: "Beklemede",
    responsible: "Merve A."
  },
  {
    id: "3",
    recordId: "AR-2025-000985",
    context: "Delta Sanayi Ltd.",
    type: "Tahsilat",
    date: "16.05.2025 11:48",
    status: "Onay Bekliyor",
    responsible: "Ahmet B."
  },
  {
    id: "4",
    recordId: "AR-2025-000984",
    context: "Nova İnşaat A.Ş.",
    type: "Teslimat",
    date: "15.05.2025 17:22",
    status: "Onaylı",
    responsible: "Selin Y."
  },
  {
    id: "5",
    recordId: "AR-2025-000983",
    context: "Beta Gıda Tic.",
    type: "İade",
    date: "15.05.2025 16:05",
    status: "Beklemede",
    responsible: "Can D."
  },
  {
    id: "6",
    recordId: "AR-2025-000982",
    context: "Omega Tekstil A.Ş.",
    type: "Belge",
    date: "15.05.2025 14:40",
    status: "Onaylı",
    responsible: "Yasin K."
  },
  {
    id: "7",
    recordId: "AR-2025-000981",
    context: "Prime Otomotiv Ltd.",
    type: "Fatura",
    date: "15.05.2025 10:18",
    status: "Onay Bekliyor",
    responsible: "Merve A."
  },
  {
    id: "8",
    recordId: "AR-2025-000980",
    context: "Atlas Enerji A.Ş.",
    type: "Sipariş",
    date: "14.05.2025 18:55",
    status: "Onaylı",
    responsible: "Ahmet B."
  }
];

export const AOM_TABLE_TOTAL = "Toplam 12.458 kayıt";
export const AOM_PAGE_SIZE_LABEL = "10 / sayfa";
export const AOM_PAGE_NUMBERS = ["1", "2", "3", "…", "125"] as const;

export const AOM_RETENTION_NOTE = "Bu kayıt 7 yıl saklama politikasına tabidir.";

export const AOM_CONTEXT_BY_ROW: Record<string, ArsivContextDetail> = {
  "1": {
    recordId: "AR-2025-000987",
    type: "Fatura",
    context: "ABC Ticaret A.Ş.",
    date: "16.05.2025 14:32",
    status: "Onaylı",
    responsible: "Yasin K.",
    auditTrail: [
      { id: "a1", title: "Kayıt oluşturuldu", actor: "Yasin K.", time: "16.05.2025 14:10" },
      { id: "a2", title: "Belge yüklendi", actor: "Merve A.", time: "16.05.2025 14:22" },
      { id: "a3", title: "Onaylandı", actor: "Ahmet B.", time: "16.05.2025 14:32" }
    ],
    documentName: "FATURA_ABC_2025-000987.pdf",
    documentSize: "1,24 MB",
    documentType: "PDF",
    documentPages: "3",
    documentTags: ["Fatura", "2025-05"]
  }
};

export function getAomContext(rowId: string): ArsivContextDetail {
  const base = AOM_CONTEXT_BY_ROW["1"]!;
  const row = AOM_TABLE_ROWS.find((r) => r.id === rowId);
  if (!row) return base;
  return {
    ...base,
    recordId: row.recordId,
    type: row.type,
    context: row.context,
    date: row.date,
    status: row.status,
    responsible: row.responsible
  };
}
