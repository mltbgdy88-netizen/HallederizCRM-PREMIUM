import type { QuickOperationSubmitResponse, QuickOperationType, QuickOperationWorkflowImpact } from "@hallederiz/types";
import { ApiError } from "@hallederiz/sdk";
import {
  MSG_SUBMIT_APPROVALS_HINT,
  MSG_SUBMIT_DRAFT_READY,
  MSG_SUBMIT_FAILED,
  MSG_SUBMIT_NOT_LIVE,
  MSG_SUBMIT_PREVIEW,
  MSG_SUBMIT_QUEUE_PENDING,
  MSG_SUBMIT_QUEUE_WHEN_READY,
  MSG_SUBMIT_TASLAK_REF_PREFIX,
  MSG_SUBMIT_VALIDATION_FAILED
} from "../data/quick-operation-messages";

const TECHNICAL_PATTERN =
  /api|mock|fallback|dispatcher|worker|outbox|mutation|execution|not_configured|operation|submit/i;

const FALSE_SUCCESS_PATTERN =
  /\bolu[sş]turuldu\b|\bkaydedildi\b|\btamamland[ıi]\b|\bgönderildi\b|\bgonderildi\b/i;

export type QuickOperationSubmitFeedback = {
  notice: string;
  toast: string;
  showApprovalsLink: boolean;
  detailHref?: string;
  detailLabel?: string;
};

function containsTechnicalTerms(value: string): boolean {
  return TECHNICAL_PATTERN.test(value);
}

function containsFalseSuccessTerms(value: string): boolean {
  return FALSE_SUCCESS_PATTERN.test(value);
}

export function sanitizeSubmitUserText(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }
  if (containsFalseSuccessTerms(trimmed)) {
    return trimmed
      .replace(/\bolu[sş]turuldu\b/gi, "hazırlandı")
      .replace(/\bkaydedildi\b/gi, "hazırlandı")
      .replace(/\btamamland[ıi]\b/gi, "işlenecek")
      .replace(/\bgönderildi\b/gi, "iletilecek")
      .replace(/\bgonderildi\b/gi, "iletilecek");
  }
  if (containsTechnicalTerms(trimmed)) {
    return MSG_SUBMIT_QUEUE_PENDING;
  }
  return trimmed;
}

export function sanitizeSubmitImpacts(impacts: QuickOperationWorkflowImpact[]): QuickOperationWorkflowImpact[] {
  return impacts.map((impact) => ({
    ...impact,
    title: sanitizeSubmitUserText(impact.title),
    description: sanitizeSubmitUserText(impact.description)
  }));
}

function formatReference(referenceNo?: string): string {
  const ref = referenceNo?.trim();
  if (!ref || ref === "—") {
    return "";
  }
  return `${MSG_SUBMIT_TASLAK_REF_PREFIX} ${ref}`;
}

function resolveDetailLink(
  result: QuickOperationSubmitResponse,
  useDemoData: boolean
): { href: string; label: string } | null {
  if (useDemoData || result.mode !== "executed" || !result.createdEntityId || !result.createdEntityType) {
    return null;
  }

  switch (result.createdEntityType) {
    case "offer":
      return { href: `/teklifler/${result.createdEntityId}`, label: "Teklif detayına git" };
    case "order":
      return { href: `/siparisler/${result.createdEntityId}`, label: "Sipariş detayına git" };
    case "payment":
      return { href: `/tahsilatlar/${result.createdEntityId}`, label: "Tahsilat detayına git" };
    case "delivery":
      return { href: `/teslimatlar/${result.createdEntityId}`, label: "Teslimat detayına git" };
    case "return":
      return { href: `/iadeler/${result.createdEntityId}`, label: "İade detayına git" };
    default:
      return null;
  }
}

function segmentLabel(operationType: QuickOperationType): string {
  switch (operationType) {
    case "offer":
      return "Teklif";
    case "sale_order":
      return "Sipariş";
    case "payment":
      return "Tahsilat";
    case "delivery":
      return "Teslim";
    case "return":
      return "İade";
    default:
      return "İşlem";
  }
}

export function resolveSubmitFeedback(
  result: QuickOperationSubmitResponse,
  options: { useDemoData: boolean; operationType: QuickOperationType }
): QuickOperationSubmitFeedback {
  const refSuffix = formatReference(result.createdEntityNo);
  const detail = resolveDetailLink(result, options.useDemoData);

  if (options.useDemoData) {
    const notice = [MSG_SUBMIT_DRAFT_READY, refSuffix, MSG_SUBMIT_PREVIEW].filter(Boolean).join(" ");
    return {
      notice,
      toast: notice,
      showApprovalsLink: false
    };
  }

  if (!result.ok) {
    const notice = [MSG_SUBMIT_VALIDATION_FAILED, refSuffix].filter(Boolean).join(" ");
    return {
      notice,
      toast: notice,
      showApprovalsLink: false
    };
  }

  if (result.mode === "foundation" || !result.createdEntityId) {
    const notice = [MSG_SUBMIT_QUEUE_PENDING, refSuffix, MSG_SUBMIT_QUEUE_WHEN_READY].filter(Boolean).join(" ");
    return {
      notice,
      toast: `${MSG_SUBMIT_QUEUE_PENDING} ${MSG_SUBMIT_APPROVALS_HINT}`,
      showApprovalsLink: true,
      detailHref: detail?.href,
      detailLabel: detail?.label
    };
  }

  const notice = [
    `${segmentLabel(options.operationType)} taslağı hazırlandı.`,
    refSuffix,
    MSG_SUBMIT_QUEUE_WHEN_READY
  ]
    .filter(Boolean)
    .join(" ");

  return {
    notice,
    toast: `${MSG_SUBMIT_QUEUE_PENDING} ${MSG_SUBMIT_APPROVALS_HINT}`,
    showApprovalsLink: true,
    detailHref: detail?.href,
    detailLabel: detail?.label
  };
}

export function mapSubmitActionError(error: unknown): string {
  if (error instanceof ApiError) {
    const raw = error.message.trim();
    const lower = raw.toLowerCase();

    if (error.status === 401) {
      return "Oturum süresi doldu. Tekrar giriş yapın.";
    }
    if (error.status === 403) {
      return "Bu işlem için yetkiniz yok.";
    }
    if (error.status === 404) {
      return "İşlem kaynağı bulunamadı. Cari veya satırları kontrol edin.";
    }
    if (error.status === 409) {
      return "Kayıt zaten işlendi veya bu adım tekrarlanamaz.";
    }
    if (error.status === 503 || containsTechnicalTerms(raw)) {
      return MSG_SUBMIT_NOT_LIVE;
    }
    if (raw && !containsTechnicalTerms(raw) && !containsFalseSuccessTerms(raw)) {
      return raw;
    }
    return MSG_SUBMIT_FAILED;
  }

  if (error instanceof Error) {
    const raw = error.message.trim();
    if (raw && !containsTechnicalTerms(raw) && !containsFalseSuccessTerms(raw)) {
      return raw;
    }
  }

  return MSG_SUBMIT_FAILED;
}
