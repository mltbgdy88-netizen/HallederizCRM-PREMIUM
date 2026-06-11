import { sanitizeUserFacingText } from "./approval-action-feedback";
import {
  approvalOperationTypeLabel,
  approvalRiskLabel,
  approvalSourceFromRecord,
  approvalSourceLabel,
  formatQueueTime,
  linkedRecordChips,
  proposedActionBullets
} from "./approval-command-desk-present";
import type { ApprovalInboxCategory, ApprovalInboxRecord } from "../components/inbox/types";

export type OkmReferenceIcon = "stock" | "customer" | "document" | "finance";
export type OkmKpiTone = "green" | "gold";
export type OkmKpiIcon = "hourglass" | "cart" | "user" | "document" | "finance";

export type OkmReferenceKpi = {
  id: string;
  label: string;
  value: string;
  tone: OkmKpiTone;
  icon: OkmKpiIcon;
};

export type OkmReferencePendingCard = {
  id: string;
  title: string;
  ref: string;
  requester: string;
  dateTime: string;
  status: string;
  icon: OkmReferenceIcon;
};

export type OkmReferenceField = {
  label: string;
  value: string;
};

export type OkmReferenceHistoryItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
};

export type OkmReferenceDetail = {
  title: string;
  ref: string;
  dateTime: string;
  priority: string;
  requesterLabel: string;
  requester: string;
  requesterRole: string;
  departmentLabel: string;
  department: string;
  description: string;
  productTitle: string;
  productFields: OkmReferenceField[];
  extraTitle: string;
  extraFields: OkmReferenceField[];
  historyTitle: string;
  history: OkmReferenceHistoryItem[];
};

export type OkmReferenceActionMeta = {
  label: string;
  value: string;
};

const STATUS_LABELS: Record<ApprovalInboxRecord["status"], string> = {
  bekliyor: "Bekliyor",
  incelemede: "İncelemede",
  onay_bekliyor: "Onay Bekliyor",
  sure_asildi: "Süre Aşıldı"
};

function mapCategoryToIcon(category: ApprovalInboxCategory): OkmReferenceIcon {
  if (category === "satis") return "customer";
  if (category === "belge") return "document";
  if (category === "finans") return "finance";
  return "stock";
}

function pendingRows(rows: ApprovalInboxRecord[]): ApprovalInboxRecord[] {
  return rows.filter((row) => row.raw.status === "pending");
}

export function mapRowsToReferenceKpis(rows: ApprovalInboxRecord[]): OkmReferenceKpi[] {
  const pending = pendingRows(rows);
  return [
    {
      id: "total",
      label: "Toplam Bekleyen",
      value: String(pending.length),
      tone: "green",
      icon: "hourglass"
    },
    {
      id: "stock",
      label: "Stok Onayı",
      value: String(pending.filter((row) => row.category === "operasyon").length),
      tone: "gold",
      icon: "cart"
    },
    {
      id: "customer",
      label: "Müşteri Onayı",
      value: String(pending.filter((row) => row.category === "satis").length),
      tone: "green",
      icon: "user"
    },
    {
      id: "document",
      label: "Belge Onayı",
      value: String(pending.filter((row) => row.category === "belge").length),
      tone: "green",
      icon: "document"
    },
    {
      id: "finance",
      label: "Finans Onayı",
      value: String(pending.filter((row) => row.category === "finans" || row.category === "ai").length),
      tone: "gold",
      icon: "finance"
    }
  ];
}

export function mapRecordToPendingCard(record: ApprovalInboxRecord): OkmReferencePendingCard {
  const refParts = [record.approvalNo, record.entityLabel || record.customerName].filter(Boolean);
  return {
    id: record.id,
    title: record.title,
    ref: refParts.join(" • "),
    requester: record.summary.requesterName || record.meta.requester || "—",
    dateTime: formatQueueTime(record),
    status: STATUS_LABELS[record.status] ?? "Bekliyor",
    icon: mapCategoryToIcon(record.category)
  };
}

export function mapRecordToReferenceDetail(record: ApprovalInboxRecord): OkmReferenceDetail {
  const source = approvalSourceFromRecord(record);
  const description = sanitizeUserFacingText(
    record.raw.payloadSummary || record.internalNote.body || record.workflowLabel
  );
  const bullets = proposedActionBullets(record);
  const chips = linkedRecordChips(record);

  const productFields: OkmReferenceField[] = [
    { label: "Onay No", value: record.approvalNo },
    { label: "İşlem Türü", value: approvalOperationTypeLabel(record.raw.type) },
    { label: "Tutar", value: record.amountLabel || "—" },
    { label: "Cari", value: record.customerName || "—" },
    { label: "Kaynak", value: approvalSourceLabel(source) },
    { label: "SLA", value: record.slaLabel || "—" }
  ];

  const extraFields: OkmReferenceField[] = chips.slice(0, 6).map((chip) => ({
    label: chip.label.split(":")[0]?.trim() || "Kayıt",
    value: chip.label.includes(":") ? chip.label.split(":").slice(1).join(":").trim() : chip.label
  }));

  if (record.raw.requestedRole) {
    extraFields.push({ label: "İstenen Rol", value: record.raw.requestedRole });
  }
  if (record.assigneeName && record.assigneeName !== "—") {
    extraFields.push({ label: "Atanan", value: record.assigneeName });
  }

  const history =
    record.timeline.length > 0
      ? record.timeline.map((step) => ({
          id: step.id,
          title: step.label,
          detail: record.workflowLabel,
          time: step.at
        }))
      : bullets.map((line, index) => ({
          id: `bullet_${index}`,
          title: index === 0 ? "Önerilen işlem" : "Not",
          detail: line,
          time: formatQueueTime(record)
        }));

  return {
    title: record.title,
    ref: record.approvalNo,
    dateTime: formatQueueTime(record),
    priority: approvalRiskLabel(record),
    requesterLabel: "Talep Eden",
    requester: record.summary.requesterName || record.meta.requester || "—",
    requesterRole: record.assigneeRole || record.raw.requestedRole || "—",
    departmentLabel: "Departman",
    department: record.meta.branch || "Operasyon",
    description: description || bullets[0] || "Onay detayı yükleniyor.",
    productTitle: "İşlem Özeti",
    productFields,
    extraTitle: "Bağlı Kayıtlar ve Meta",
    extraFields: extraFields.length ? extraFields : [{ label: "Kayıt", value: record.entityLabel || "—" }],
    historyTitle: "İşlem Geçmişi",
    history
  };
}

export function mapRecordToActionMeta(record: ApprovalInboxRecord): OkmReferenceActionMeta[] {
  const source = approvalSourceFromRecord(record);
  return [
    { label: "Onay Süreci", value: record.workflowLabel || "Operasyon onayı" },
    { label: "Mevcut Aşama", value: STATUS_LABELS[record.status] ?? "Bekliyor" },
    { label: "Risk", value: approvalRiskLabel(record) },
    { label: "Kaynak", value: approvalSourceLabel(source) },
    { label: "İstenen Rol", value: record.raw.requestedRole || "—" }
  ];
}
