// @ts-nocheck
import type { Approval, ApprovalType } from "@hallederiz/types";
import { sanitizeUserFacingText } from "./approval-action-feedback";
import type { ApprovalInboxRecord } from "../components/inbox/types";

export type ApprovalSourceKind = "ai" | "automation" | "message" | "unknown";
export type ApprovalSourceFilter = "all" | ApprovalSourceKind | "high_risk";
export type ApprovalRiskLabel = "YÃ¼ksek" | "Orta" | "DÃ¼ÅŸÃ¼k";

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
      return "AI Ã¶nerisi";
    case "automation":
      return "Otomasyon";
    case "message":
      return "Mesaj kaynaklÄ±";
    default:
      return "Kaynak belirtilmedi";
  }
}

export function approvalSourceFromRecord(record: ApprovalInboxRecord): ApprovalSourceKind {
  return resolveApprovalSourceKind(record.raw);
}

export function approvalRiskLabel(record: ApprovalInboxRecord): ApprovalRiskLabel {
  if (record.riskLevel === "kritik" || record.riskLevel === "yuksek" || record.priority === "kritik" || record.priority === "yuksek") {
    return "YÃ¼ksek";
  }
  if (record.riskLevel === "orta" || record.priority === "orta") {
    return "Orta";
  }
  return "DÃ¼ÅŸÃ¼k";
}

export function isHighRiskRecord(record: ApprovalInboxRecord): boolean {
  return approvalRiskLabel(record) === "YÃ¼ksek";
}

export function approvalWhyRequiredText(kind: ApprovalSourceKind): string {
  switch (kind) {
    case "ai":
      return "Bu iÅŸlem AI Ã¶nerisi olduÄŸu iÃ§in kullanÄ±cÄ± onayÄ± gerektirir.";
    case "automation":
      return "Bu iÅŸlem otomasyon kaynaÄŸÄ±ndan geldiÄŸi iÃ§in kullanÄ±cÄ± onayÄ± gerektirir.";
    case "message":
      return "Bu iÅŸlem mesaj kaynaklÄ± Ã¶neri olduÄŸu iÃ§in kullanÄ±cÄ± onayÄ± gerektirir.";
    default:
      return "Bu Ã¶neri kaynaÄŸÄ± doÄŸrulanana kadar kullanÄ±cÄ± onayÄ± gerektirir.";
  }
}

export function approvalSourceEngineLabel(kind: ApprovalSourceKind): string {
  switch (kind) {
    case "ai":
      return "AI Ã–neri Motoru";
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
    order_high_value: "YÃ¼ksek tutarlÄ± sipariÅŸ",
    delivery_payment_missing: "Eksik tahsilatlÄ± teslim",
    return_approval: "Ä°ade onayÄ±",
    price_override: "Fiyat deÄŸiÅŸikliÄŸi",
    ai_action_proposal: "AI Ã¶nerisi",
    manual_operation: "Operasyon Ã¶nerisi"
  };
  return labels[type] ?? "Onay Ã¶nerisi";
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
    bullets.push(`${record.workflowLabel} iÃ§in Ã¶nerilen adÄ±mÄ± inceleyin ve onaylayÄ±n.`);
  }
  return bullets.slice(0, 5);
}

export function linkedRecordChips(record: ApprovalInboxRecord): { label: string; href?: string }[] {
  const chips: { label: string; href?: string }[] = [
    { label: `Cari: ${record.customerName}`, href: "/cariler" }
  ];

  const entity = record.summary.relatedRecordLabel;
  if (entity && entity !== "â€”") {
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
    chips.push({ label: "SipariÅŸ", href: "/siparisler" });
  }
  if (type === "return_approval") {
    chips.push({ label: "Ä°ade", href: "/iadeler" });
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

