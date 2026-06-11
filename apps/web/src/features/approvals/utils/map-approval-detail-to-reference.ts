import { canExecuteApprovedAction, summarizeApprovalTarget } from "@hallederiz/domain";
import type { Approval, ApprovalStatus } from "@hallederiz/types";
import { dataSourceConfig } from "../../../lib/data-source";
import { mapApprovalToInboxRecord } from "../components/inbox/map-approvals-to-inbox";
import {
  approvalOperationTypeLabel,
  approvalSourceLabel,
  approvalWhyRequiredText,
  resolveApprovalSourceKind
} from "./approval-command-desk-present";
import {
  mapRecordToActionMeta,
  mapRecordToReferenceDetail,
  type OkmReferenceField
} from "./map-inbox-to-reference-desk";
import { resolveApprovalEntityLink, sanitizeUserFacingText } from "./approval-action-feedback";

const STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: "Bekliyor",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  expired: "Süresi doldu",
  executed: "İşlendi"
};

export type OdkRiskTone = "warn" | "ok" | "danger";

export type OdkRiskItem = {
  label: string;
  value: string;
  tone: OdkRiskTone;
};

export type OdkImpactItem = {
  label: string;
  value: string;
  negative?: boolean;
};

export type OdkHistoryItem = {
  id: string;
  actor: string;
  action: string;
  time: string;
};

export type OdkRelatedItem = {
  label: string;
  value: string;
  href?: string;
};

export type OdkAttachmentItem = {
  name: string;
  size: string;
};

export type OdkPriceComparison = {
  current: { label: string; price: string; supplier: string };
  requested: { label: string; price: string; supplier: string };
  diff: string;
};

export type ApprovalDetailReferenceView = {
  breadcrumb: string;
  title: string;
  approvalNo: string;
  typeLabel: string;
  statusLabel: string;
  statusTone: "wait" | "ok" | "reject";
  createdLabel: string;
  requesterLabel: string;
  entityCode: string;
  entityName: string;
  entityStockStatus: string;
  summaryFields: OkmReferenceField[];
  reason: string;
  related: OdkRelatedItem[];
  attachments: OdkAttachmentItem[];
  priceComparison: OdkPriceComparison | null;
  risks: OdkRiskItem[];
  impact: OdkImpactItem[];
  history: OdkHistoryItem[];
  whyRequired: string;
  metaRows: { label: string; value: string }[];
  entityLink: { href: string; label: string };
  executable: boolean;
};

function formatDateTime(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function statusTone(status: ApprovalStatus): "wait" | "ok" | "reject" {
  if (status === "approved" || status === "executed") return "ok";
  if (status === "rejected" || status === "expired") return "reject";
  return "wait";
}

function readPayloadString(payload: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return null;
}

function buildPriceComparison(approval: Approval): OdkPriceComparison | null {
  if (approval.type !== "price_override") return null;
  const payload = approval.payload ?? {};
  const current = readPayloadString(payload, ["currentPrice", "oldPrice", "listPrice"]);
  const requested = readPayloadString(payload, ["requestedPrice", "newPrice", "proposedPrice"]);
  if (!current && !requested) return null;
  return {
    current: {
      label: "Mevcut Fiyat",
      price: current ?? "—",
      supplier: readPayloadString(payload, ["currentSupplier", "supplier"]) ?? "—"
    },
    requested: {
      label: "Talep Edilen",
      price: requested ?? "—",
      supplier: readPayloadString(payload, ["requestedSupplier", "supplier"]) ?? "—"
    },
    diff: readPayloadString(payload, ["priceDiff", "diff"]) ?? "—"
  };
}

function buildAttachments(approval: Approval): OdkAttachmentItem[] {
  const raw = approval.payload?.attachments;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const name = typeof record.name === "string" ? record.name : `Ek ${index + 1}`;
      const size = typeof record.size === "string" ? record.size : "—";
      return { name, size };
    })
    .filter((item): item is OdkAttachmentItem => item !== null);
}

function buildHistory(approval: Approval): OdkHistoryItem[] {
  const items: OdkHistoryItem[] = [
    {
      id: "created",
      actor: approval.requestedByName || "Talep eden",
      action: "Onay talebi oluşturuldu",
      time: formatDateTime(approval.createdAt)
    }
  ];
  if (approval.decidedByName && approval.decidedAt) {
    items.push({
      id: "decided",
      actor: approval.decidedByName,
      action: STATUS_LABELS[approval.status],
      time: formatDateTime(approval.decidedAt)
    });
  }
  if (approval.execution.executedAt) {
    items.push({
      id: "executed",
      actor: approval.decidedByName || "Sistem",
      action: "İşlem yürütüldü",
      time: formatDateTime(approval.execution.executedAt)
    });
  }
  return items;
}

function buildRisks(approval: Approval, priority: string): OdkRiskItem[] {
  const sourceKind = resolveApprovalSourceKind(approval);
  const risks: OdkRiskItem[] = [
    {
      label: "Öncelik",
      value: priority,
      tone: priority === "Yüksek" ? "danger" : priority === "Orta" ? "warn" : "ok"
    },
    {
      label: "Kaynak",
      value: approvalSourceLabel(sourceKind),
      tone: sourceKind === "ai" ? "warn" : "ok"
    }
  ];
  if (approval.riskNote?.trim()) {
    risks.push({
      label: "Risk Notu",
      value: sanitizeUserFacingText(approval.riskNote),
      tone: "warn"
    });
  }
  if (approval.policySnapshot?.reason) {
    risks.push({
      label: "Politika",
      value: sanitizeUserFacingText(approval.policySnapshot.reason),
      tone: "ok"
    });
  }
  return risks;
}

function buildImpact(approval: Approval): OdkImpactItem[] {
  const payload = approval.payload ?? {};
  const amount = readPayloadString(payload, ["amount", "total", "grandTotal", "impactAmount"]);
  const items: OdkImpactItem[] = [
    {
      label: "Hedef Kayıt",
      value: `${approval.entityType} / ${approval.entityNo}`
    },
    {
      label: "Tutar Etkisi",
      value: amount ?? "—",
      negative: approval.type === "return_approval"
    },
    {
      label: "Yürütme",
      value: canExecuteApprovedAction(approval) ? "Onay sonrası icra edilebilir" : "Beklemede"
    }
  ];
  if (approval.execution.result) {
    items.push({
      label: "Sonuç",
      value: sanitizeUserFacingText(String(approval.execution.result))
    });
  }
  return items;
}

function buildRelated(approval: Approval, entityLink: { href: string; label: string }): OdkRelatedItem[] {
  return [
    { label: "Bağlı Kayıt", value: entityLink.label, href: entityLink.href },
    { label: "Entity Tipi", value: approval.entityType },
    { label: "Entity No", value: approval.entityNo },
    { label: "İstenen Rol", value: approval.requestedRole || "—" },
    {
      label: "Sunucu Aksiyonu",
      value: approval.policySnapshot.serverActionKey ?? "—"
    }
  ];
}

export function mapApprovalToDetailReference(approval: Approval): ApprovalDetailReferenceView {
  const record = mapApprovalToInboxRecord(approval, dataSourceConfig.userId);
  const deskDetail = mapRecordToReferenceDetail(record);
  const sourceKind = resolveApprovalSourceKind(approval);
  const entityLink = resolveApprovalEntityLink(approval);

  return {
    breadcrumb: "Onaylar / Detay",
    title: deskDetail.title || approvalOperationTypeLabel(approval.type),
    approvalNo: approval.approvalNo,
    typeLabel: approvalOperationTypeLabel(approval.type),
    statusLabel: STATUS_LABELS[approval.status],
    statusTone: statusTone(approval.status),
    createdLabel: formatDateTime(approval.createdAt),
    requesterLabel: approval.requestedByName || "—",
    entityCode: approval.entityNo || approval.approvalNo,
    entityName: summarizeApprovalTarget(approval),
    entityStockStatus: approval.status === "pending" ? "Onay Bekliyor" : STATUS_LABELS[approval.status],
    summaryFields: deskDetail.productFields,
    reason:
      sanitizeUserFacingText(approval.payloadSummary) ||
      sanitizeUserFacingText(approval.policySnapshot.reason) ||
      deskDetail.description,
    related: buildRelated(approval, entityLink),
    attachments: buildAttachments(approval),
    priceComparison: buildPriceComparison(approval),
    risks: buildRisks(approval, deskDetail.priority),
    impact: buildImpact(approval),
    history: buildHistory(approval),
    whyRequired: approvalWhyRequiredText(sourceKind),
    metaRows: mapRecordToActionMeta(record),
    entityLink,
    executable: canExecuteApprovedAction(approval)
  };
}
