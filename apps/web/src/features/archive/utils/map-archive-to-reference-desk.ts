import type { ArchiveRecord, ArchiveRecordStatus } from "../types";

export type AomReferenceStatus = "Onaylı" | "Beklemede" | "Onay Bekliyor";
export type AomKpiTone = "green" | "gold" | "teal" | "blue" | "slate" | "orange";
export type AomKpiIcon = "database" | "clock" | "check" | "pending" | "alert" | "archive";

export type AomReferenceKpi = {
  id: string;
  label: string;
  value: string;
  tone: AomKpiTone;
  icon: AomKpiIcon;
};

export type AomReferenceTableRow = {
  id: string;
  recordId: string;
  context: string;
  type: string;
  date: string;
  status: AomReferenceStatus;
  responsible: string;
  relatedHref?: string;
};

export type AomAuditEvent = {
  id: string;
  title: string;
  actor: string;
  time: string;
};

export type AomReferenceContext = {
  recordId: string;
  title: string;
  type: string;
  context: string;
  date: string;
  status: AomReferenceStatus;
  responsible: string;
  sourceLabel: string;
  auditTrail: AomAuditEvent[];
  documentName: string;
  documentSize: string;
  documentType: string;
  documentPages: string;
  documentTags: string[];
  retentionNote: string;
  relatedLinks: { label: string; href: string }[];
};

function formatArchiveDate(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(iso));
}

function formatArchiveTime(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

export function mapArchiveStatus(status: ArchiveRecordStatus): AomReferenceStatus {
  switch (status) {
    case "onaylandi":
    case "arsivlendi":
      return "Onaylı";
    case "bekliyor":
      return "Beklemede";
    case "reddedildi":
    case "riskli":
      return "Onay Bekliyor";
    default:
      return "Beklemede";
  }
}

export function statusBadgeClass(status: AomReferenceStatus): string {
  if (status === "Onaylı") return "aom-badge aom-badge--ok";
  if (status === "Beklemede") return "aom-badge aom-badge--pending";
  return "aom-badge aom-badge--await";
}

function sourceLabel(src: ArchiveRecord["source"]): string {
  switch (src) {
    case "crm":
      return "CRM";
    case "whatsapp":
      return "WhatsApp";
    case "ai":
      return "AI";
    case "kullanici":
      return "Kullanıcı";
    case "sistem":
      return "Sistem";
    case "ice_aktar":
      return "İçe aktar";
    default:
      return src;
  }
}

export function buildArchiveReferenceKpis(rows: ArchiveRecord[]): AomReferenceKpi[] {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const total = rows.length;
  const today = rows.filter((row) => new Date(row.createdAt) >= todayStart).length;
  const approvedDocs = rows.filter((row) => row.status === "onaylandi" || row.status === "arsivlendi").length;
  const pendingOps = rows.filter((row) => row.status === "bekliyor").length;
  const risky = rows.filter((row) => row.status === "riskli").length;
  const retention = rows.length ? "5 yıl" : "—";

  const fmt = (n: number) => new Intl.NumberFormat("tr-TR").format(n);

  return [
    { id: "total", label: "Toplam Kayıt", value: fmt(total), tone: "green", icon: "database" },
    { id: "today", label: "Bugün Eklenen", value: fmt(today), tone: "teal", icon: "clock" },
    { id: "approved", label: "Onaylı Belge", value: fmt(approvedDocs), tone: "blue", icon: "check" },
    { id: "pending", label: "Bekleyen İşlem", value: fmt(pendingOps), tone: "gold", icon: "pending" },
    { id: "risk", label: "Riskli Kayıt", value: fmt(risky), tone: "orange", icon: "alert" },
    { id: "retention", label: "Saklama Süresi", value: retention, tone: "slate", icon: "archive" }
  ];
}

export function mapArchiveRecordToTableRow(record: ArchiveRecord): AomReferenceTableRow {
  const status = mapArchiveStatus(record.status);
  return {
    id: record.id,
    recordId: record.documentNumber,
    context: `${record.customerName} · ${record.contextRef}`,
    type: record.recordType,
    date: `${formatArchiveDate(record.createdAt)} ${formatArchiveTime(record.createdAt)}`,
    status,
    responsible: record.responsible,
    relatedHref: record.relatedLinks[0]?.href
  };
}

export function mapArchiveRecordToContext(record: ArchiveRecord | null): AomReferenceContext | null {
  if (!record) return null;

  const status = mapArchiveStatus(record.status);
  const dateLabel = `${formatArchiveDate(record.createdAt)} ${formatArchiveTime(record.createdAt)}`;
  const tags = [record.recordType, sourceLabel(record.source), statusLabelPlain(record.status)].filter(Boolean);

  return {
    recordId: record.documentNumber,
    title: record.title,
    type: record.recordType,
    context: `${record.customerName} · ${record.contextRef}`,
    date: dateLabel,
    status,
    responsible: record.responsible,
    sourceLabel: sourceLabel(record.source),
    auditTrail: [
      {
        id: "created",
        title: "Oluşturuldu",
        actor: record.auditCreatedBy,
        time: dateLabel
      },
      {
        id: "last",
        title: "Son işlem",
        actor: record.responsible,
        time: record.auditLastAction
      },
      {
        id: "approval",
        title: "Onay / red",
        actor: record.auditCreatedBy,
        time: record.auditApprovalInfo
      }
    ],
    documentName: record.fileName ?? "—",
    documentSize: record.fileSizeLabel ?? "—",
    documentType: record.fileTypeLabel ?? record.recordType,
    documentPages: "—",
    documentTags: tags,
    retentionNote:
      record.retentionYears != null
        ? `Bu kayıt ${record.retentionYears} yıl saklama politikasına tabidir.`
        : "Bu kayıt 7 yıl saklama politikasına tabidir.",
    relatedLinks: record.relatedLinks
  };
}

function statusLabelPlain(s: ArchiveRecordStatus): string {
  switch (s) {
    case "onaylandi":
      return "Onaylandı";
    case "bekliyor":
      return "Bekliyor";
    case "reddedildi":
      return "Reddedildi";
    case "riskli":
      return "Riskli";
    case "arsivlendi":
      return "Arşivlendi";
    default:
      return s;
  }
}
