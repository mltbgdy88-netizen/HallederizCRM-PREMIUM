import { ARCHIVE_DEMO_RECORDS } from "../../archive/data/archive-demo-records";
import { getArchiveLiveRecords } from "../../archive/queries/get-archive-live-records";
import type { ArchiveRecord, ArchiveRecordStatus } from "../../archive/types";
import { REFERENCE_DEMO_BANNER } from "../../../lib/reference/constants";
import { formatTrDateTime } from "../../../lib/reference/formatters";
import {
  AOM_CATEGORY_TABS,
  AOM_FILTERS,
  AOM_FILTER_SEARCH_PLACEHOLDER,
  AOM_PAGE_NUMBERS,
  AOM_PAGE_SIZE_LABEL,
  AOM_RETENTION_NOTE,
  AOM_SUBTITLE,
  AOM_TABLE_TOTAL,
  AOM_TITLE,
  type ArsivContextDetail,
  type ArsivKpi,
  type ArsivRecordStatus,
  type ArsivTableRow
} from "../data/arsiv-operasyon-mock";

export type ArsivReferenceSnapshot = {
  title: string;
  subtitle: string;
  kpis: ArsivKpi[];
  categoryTabs: typeof AOM_CATEGORY_TABS;
  filterSearchPlaceholder: string;
  filters: typeof AOM_FILTERS;
  demoBanner: string | null;
  tableRows: ArsivTableRow[];
  tableTotal: string;
  pageNumbers: readonly string[];
  pageSizeLabel: string;
  retentionNote: string;
  getContext: (rowId: string) => ArsivContextDetail;
};

function mapStatus(status: ArchiveRecordStatus): ArsivRecordStatus {
  switch (status) {
    case "onaylandi":
    case "arsivlendi":
      return "Onaylı";
    case "bekliyor":
      return "Beklemede";
    case "riskli":
      return "Onay Bekliyor";
    default:
      return "Beklemede";
  }
}

function mapRow(record: ArchiveRecord, index: number): ArsivTableRow {
  return {
    id: record.id || String(index + 1),
    recordId: record.documentNumber,
    context: record.customerName || record.title,
    type: record.recordType,
    date: formatTrDateTime(record.createdAt),
    status: mapStatus(record.status),
    responsible: record.responsible
  };
}

function buildContext(record: ArchiveRecord): ArsivContextDetail {
  return {
    recordId: record.documentNumber,
    type: record.recordType,
    context: record.customerName || record.title,
    date: formatTrDateTime(record.createdAt),
    status: mapStatus(record.status),
    responsible: record.responsible,
    auditTrail: [
      {
        id: "1",
        title: record.auditLastAction,
        actor: record.auditCreatedBy,
        time: formatTrDateTime(record.createdAt)
      },
      {
        id: "2",
        title: record.auditApprovalInfo,
        actor: record.responsible,
        time: "—"
      }
    ],
    documentName: record.fileName ?? record.title,
    documentSize: record.fileSizeLabel ?? "—",
    documentType: record.fileTypeLabel ?? record.recordType,
    documentPages: "—",
    documentTags: record.categoryKey ? [record.categoryKey] : []
  };
}

function buildSnapshot(records: ArchiveRecord[], demoBanner: string | null): ArsivReferenceSnapshot {
  const rows = records.map(mapRow);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const kpis: ArsivKpi[] = [
    {
      id: "total",
      label: "Toplam Kayıt",
      value: String(records.length),
      tone: "green"
    },
    {
      id: "today",
      label: "Bugün Eklenen",
      value: String(records.filter((r) => new Date(r.createdAt) >= todayStart).length),
      tone: "teal"
    },
    {
      id: "approved",
      label: "Onaylı Belge",
      value: String(records.filter((r) => r.status === "onaylandi" || r.status === "arsivlendi").length),
      tone: "blue"
    },
    {
      id: "pending",
      label: "Bekleyen İşlem",
      value: String(records.filter((r) => r.status === "bekliyor").length),
      tone: "gold"
    },
    {
      id: "risk",
      label: "Riskli Kayıt",
      value: String(records.filter((r) => r.status === "riskli").length),
      tone: "orange"
    },
    {
      id: "retention",
      label: "Saklama Süresi",
      value: records[0]?.retentionYears ? `${records[0].retentionYears} yıl` : "5 yıl",
      tone: "slate"
    }
  ];

  const contextById = new Map(rows.map((r) => [r.id, records.find((rec) => rec.id === r.id)!]));

  return {
    title: AOM_TITLE,
    subtitle: AOM_SUBTITLE,
    kpis,
    categoryTabs: AOM_CATEGORY_TABS,
    filterSearchPlaceholder: AOM_FILTER_SEARCH_PLACEHOLDER,
    filters: AOM_FILTERS,
    demoBanner,
    tableRows: rows,
    tableTotal: `${records.length} kayıt`,
    pageNumbers: AOM_PAGE_NUMBERS,
    pageSizeLabel: AOM_PAGE_SIZE_LABEL,
    retentionNote: AOM_RETENTION_NOTE,
    getContext: (rowId: string) => {
      const rec = contextById.get(rowId) ?? records[0];
      if (!rec) {
        return buildContext({
          id: "empty",
          documentNumber: "—",
          title: "Kayıt yok",
          customerName: "—",
          contextRef: "—",
          recordType: "Belge",
          categoryKey: "belge",
          source: "sistem",
          status: "bekliyor",
          responsible: "—",
          createdAt: new Date().toISOString(),
          auditCreatedBy: "—",
          auditLastAction: "—",
          auditApprovalInfo: "—",
          relatedLinks: []
        });
      }
      return buildContext(rec);
    }
  };
}

export const ARSIV_REFERENCE_INITIAL = buildSnapshot(ARCHIVE_DEMO_RECORDS, null);

export function loadArsivReferenceDemo(): ArsivReferenceSnapshot {
  return buildSnapshot(ARCHIVE_DEMO_RECORDS, null);
}

export async function loadArsivReferenceLive(): Promise<ArsivReferenceSnapshot> {
  const result = await getArchiveLiveRecords();
  if (!result.liveReady || !result.records.length) {
    return buildSnapshot(
      ARCHIVE_DEMO_RECORDS,
      result.message ?? REFERENCE_DEMO_BANNER
    );
  }
  return buildSnapshot(result.records, null);
}
