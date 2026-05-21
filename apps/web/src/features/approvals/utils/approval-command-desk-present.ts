import type { Approval, ApprovalType } from "@hallederiz/types";
import { sanitizeUserFacingText } from "./approval-action-feedback";
import type { ApprovalInboxRecord } from "../components/inbox/types";

export type ApprovalSourceKind = "ai" | "automation" | "message" | "unknown";
export type ApprovalSourceFilter = "all" | ApprovalSourceKind | "high_risk";
export type ApprovalRiskLabel = "Yüksek" | "Orta" | "Düşük";

const MESSAGE_HINT =
  /whatsapp|mesaj|message|omnichannel|kanal|sohbet|chat/i;

export function resolveApprovalSourceKind(approval: Approval): ApprovalSourceKind {
  if (approval.type === "ai_action_proposal") {
    return "ai";
  }

  const haystack = [
    approval.type,
    approval.policySnapshot?.serverActionKey ?? "",
    approval.payloadSummary ?? "",
    JSON.stringify(approval.payload ?? {})
  ].join(" ");

  if (MESSAGE_HINT.test(haystack)) {
    return "message";
  }

  if (
    approval.type === "manual_operation" ||
    approval.type === "order_high_value" ||
    approval.type === "delivery_payment_missing" ||
    approval.type === "return_approval" ||
    approval.type === "price_override"
  ) {
    return "automation";
  }

  return "unknown";
}

export function approvalSourceLabel(kind: ApprovalSourceKind): string {
  switch (kind) {
    case "ai":
      return "AI önerisi";
    case "automation":
      return "Otomasyon";
    case "message":
      return "Mesaj kaynaklı";
    default:
      return "Kaynak belirtilmedi";
  }
}

export function approvalSourceFromRecord(record: ApprovalInboxRecord): ApprovalSourceKind {
  return resolveApprovalSourceKind(record.raw);
}

export function approvalRiskLabel(record: ApprovalInboxRecord): ApprovalRiskLabel {
  if (record.riskLevel === "kritik" || record.riskLevel === "yuksek" || record.priority === "kritik" || record.priority === "yuksek") {
    return "Yüksek";
  }
  if (record.riskLevel === "orta" || record.priority === "orta") {
    return "Orta";
  }
  return "Düşük";
}

export function isHighRiskRecord(record: ApprovalInboxRecord): boolean {
  return approvalRiskLabel(record) === "Yüksek";
}

export function approvalWhyRequiredText(kind: ApprovalSourceKind): string {
  switch (kind) {
    case "ai":
      return "Bu işlem AI önerisi olduğu için kullanıcı onayı gerektirir.";
    case "automation":
      return "Bu işlem otomasyon kaynağından geldiği için kullanıcı onayı gerektirir.";
    case "message":
      return "Bu işlem mesaj kaynaklı öneri olduğu için kullanıcı onayı gerektirir.";
    default:
      return "Bu öneri kaynağı doğrulanana kadar kullanıcı onayı gerektirir.";
  }
}

export function approvalSourceEngineLabel(kind: ApprovalSourceKind): string {
  switch (kind) {
    case "ai":
      return "AI Öneri Motoru";
    case "automation":
      return "Otomasyon";
    case "message":
      return "Mesaj";
    default:
      return "Bilgi bekleniyor";
  }
}

export function approvalOperationTypeLabel(type: ApprovalType): string {
  const labels: Record<ApprovalType, string> = {
    order_high_value: "Yüksek tutarlı sipariş",
    delivery_payment_missing: "Eksik tahsilatlı teslim",
    return_approval: "İade onayı",
    price_override: "Fiyat değişikliği",
    ai_action_proposal: "AI önerisi",
    manual_operation: "Operasyon önerisi"
  };
  return labels[type] ?? "Onay önerisi";
}

export function proposedActionBullets(record: ApprovalInboxRecord): string[] {
  const bullets: string[] = [];
  const policyReason = sanitizeUserFacingText(record.raw.policySnapshot?.reason ?? "").trim();
  if (policyReason) {
    bullets.push(policyReason);
  }
  for (const note of record.riskBullets) {
    const clean = sanitizeUserFacingText(note).trim();
    if (clean && !bullets.includes(clean)) {
      bullets.push(clean);
    }
  }
  if (!bullets.length) {
    bullets.push(`${record.workflowLabel} için önerilen adımı inceleyin ve onaylayın.`);
  }
  return bullets.slice(0, 5);
}

export function linkedRecordChips(record: ApprovalInboxRecord): { label: string; href?: string }[] {
  const chips: { label: string; href?: string }[] = [
    { label: `Cari: ${record.customerName}`, href: "/cariler" }
  ];

  const entity = record.summary.relatedRecordLabel;
  if (entity && entity !== "—") {
    chips.push({
      label: record.summary.relatedRecordLabel,
      href: record.summary.relatedRecordHref
    });
  }

  const type = record.raw.type;
  if (type === "delivery_payment_missing") {
    chips.push({ label: "Tahsilat", href: "/tahsilatlar" });
  }
  if (type === "order_high_value") {
    chips.push({ label: "Sipariş", href: "/siparisler" });
  }
  if (type === "return_approval") {
    chips.push({ label: "İade", href: "/iadeler" });
  }
  if (type === "price_override") {
    chips.push({ label: "Teklif", href: "/teklifler" });
  }

  return chips;
}

export function filterBySourceChip(
  rows: ApprovalInboxRecord[],
  chip: ApprovalSourceFilter
): ApprovalInboxRecord[] {
  if (chip === "all") return rows;
  if (chip === "high_risk") {
    return rows.filter(isHighRiskRecord);
  }
  return rows.filter((row) => approvalSourceFromRecord(row) === chip);
}

export function countCompletedToday(rows: ApprovalInboxRecord[]): number {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return rows.filter((row) => {
    const status = row.raw.status;
    if (status !== "approved" && status !== "rejected" && status !== "executed") {
      return false;
    }
    const at = row.raw.decidedAt ?? row.raw.createdAt;
    const time = Date.parse(at);
    return Number.isFinite(time) && time >= start.getTime();
  }).length;
}

export function formatQueueTime(record: ApprovalInboxRecord): string {
  return record.summary.requestedAt || record.meta.requestedAt || record.updatedAt;
}
