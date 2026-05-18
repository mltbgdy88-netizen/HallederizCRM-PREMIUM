import type { Approval, ApprovalExecution } from "@hallederiz/types";
import { ApiError } from "@hallederiz/sdk";
import {
  MSG_APPROVAL_ACTION_FAILED,
  MSG_APPROVAL_APPROVED,
  MSG_APPROVAL_NOT_LIVE_EXECUTE,
  MSG_APPROVAL_PREVIEW_NO_EXECUTE,
  MSG_APPROVAL_PROCESS_DONE,
  MSG_APPROVAL_PROCESS_FAILED,
  MSG_APPROVAL_QUEUE_PENDING,
  MSG_APPROVAL_REJECTED
} from "../data/approval-action-messages";

const TECHNICAL_PATTERN =
  /api|mock|fallback|dispatcher|worker|outbox|mutation|execution|not_configured|policy engine|foundation/i;

function containsTechnicalTerms(value: string): boolean {
  return TECHNICAL_PATTERN.test(value);
}

export function sanitizeUserFacingText(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }
  if (/ai mutation/i.test(trimmed)) {
    return "Yapay zeka önerisi için insan onayı gerekir.";
  }
  return trimmed
    .replace(/\bmutation\b/gi, "işlem")
    .replace(/\bexecution\b/gi, "yürütme")
    .replace(/\bdispatcher\b/gi, "işlem kuyruğu")
    .replace(/\bworker\b/gi, "işlem servisi")
    .replace(/\boutbox\b/gi, "işlem kuyruğu")
    .replace(/\bfallback\b/gi, "yedek")
    .replace(/\bnot_configured\b/gi, "yapılandırılmadı")
    .replace(/\bpolicy engine\b/gi, "onay kuralı")
    .replace(/\bAPI\b/gi, "sistem")
    .replace(/\bmock\b/gi, "örnek");
}

function readExecutionPayload(execution: unknown): ApprovalExecution | null {
  if (!execution || typeof execution !== "object") {
    return null;
  }
  return execution as ApprovalExecution;
}

export function mapApprovalActionError(error: unknown): string {
  if (error instanceof ApiError) {
    const raw = error.message.trim();
    const lower = raw.toLowerCase();

    if (lower.includes("onayli") || lower.includes("not_approved") || lower.includes("approval_not_approved")) {
      return "İşleme almak için önce onay kaydını onaylayın.";
    }
    if (lower.includes("execution_action") || lower.includes("aktif execution")) {
      return "Bu kayıt için tanımlı bir işlem adımı yok.";
    }
    if (error.status === 404 || lower.includes("not found") || lower.includes("bulunamad")) {
      return "Onay kaydı bulunamadı.";
    }
    if (error.status === 409 || lower.includes("zaten") || lower.includes("conflict")) {
      return "Kayıt zaten işlendi veya bu adım tekrarlanamaz.";
    }
    if (error.status === 401) {
      return "Oturum süresi doldu. Tekrar giriş yapın.";
    }
    if (error.status === 403) {
      return "Bu işlem için yetkiniz yok.";
    }
    if (error.status === 503 || containsTechnicalTerms(raw)) {
      return MSG_APPROVAL_QUEUE_PENDING;
    }
    if (raw && !containsTechnicalTerms(raw)) {
      return raw;
    }
    return MSG_APPROVAL_ACTION_FAILED;
  }

  if (error instanceof Error) {
    const raw = error.message.trim();
    if (raw && !containsTechnicalTerms(raw)) {
      return raw;
    }
  }

  return MSG_APPROVAL_ACTION_FAILED;
}

export function resolveApproveRejectToast(kind: "approve" | "reject", useDemoData: boolean): string {
  if (useDemoData) {
    return kind === "approve"
      ? "Onay kaydı önizleme olarak onaylandı; gerçek işlem yürütülmez."
      : "Onay kaydı önizleme olarak reddedildi; gerçek işlem yürütülmez.";
  }
  return kind === "approve" ? MSG_APPROVAL_APPROVED : MSG_APPROVAL_REJECTED;
}

export function resolveExecuteFeedback(
  result: { approval: Approval; execution?: unknown },
  options: { useDemoData: boolean }
): string {
  if (options.useDemoData) {
    return MSG_APPROVAL_PREVIEW_NO_EXECUTE;
  }

  const execution = readExecutionPayload(result.execution);
  const approval = result.approval;

  if (execution?.status === "executed" || approval.status === "executed") {
    return MSG_APPROVAL_PROCESS_DONE;
  }

  if (execution?.status === "failed") {
    const resultMessage =
      typeof execution.result?.message === "string" ? execution.result.message.trim() : "";
    if (resultMessage && !containsTechnicalTerms(resultMessage)) {
      return resultMessage;
    }
    return MSG_APPROVAL_PROCESS_FAILED;
  }

  if (execution?.status === "authorized" || execution?.status === "pending") {
    return MSG_APPROVAL_QUEUE_PENDING;
  }

  if (approval.execution?.executable === false) {
    return MSG_APPROVAL_NOT_LIVE_EXECUTE;
  }

  return MSG_APPROVAL_QUEUE_PENDING;
}

export function canInboxApprove(record: Approval): boolean {
  return record.status === "pending";
}

export function canInboxReject(record: Approval): boolean {
  return record.status === "pending";
}

export function canInboxProcess(record: Approval): boolean {
  return record.status === "approved";
}

export function inboxProcessDisabledReason(record: Approval): string | null {
  if (record.status === "pending") {
    return "Önce onaylayın veya reddedin.";
  }
  if (record.status === "rejected" || record.status === "expired") {
    return "Bu kayıt işleme alınamaz.";
  }
  if (record.status === "executed") {
    return "Kayıt zaten işlendi.";
  }
  return null;
}
