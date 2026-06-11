import type { QuickOperationSubmitResponse, QuickOperationType, QuickOperationWorkflowImpact } from "@hallederiz/types";
import { containsTechnicalUserText, isOfflineLikeError } from "../../../lib/user-facing-data-error";
import { resolveOperationEntityHref } from "../../../lib/operation-entity-links";
import {
  MSG_SUBMIT_AFTER_APPROVAL,
  MSG_SUBMIT_APPROVALS_HINT,
  MSG_SUBMIT_DRAFT_READY,
  MSG_SUBMIT_FAILED,
  MSG_SUBMIT_NOT_LIVE,
  MSG_SUBMIT_PREVIEW,
  MSG_SUBMIT_QUEUED,
  MSG_SUBMIT_SENT_FOR_APPROVAL,
  MSG_SUBMIT_TASLAK_REF_PREFIX,
  MSG_SUBMIT_VALIDATION_FAILED
} from "../data/quick-operation-messages";

const TECHNICAL_PATTERN =
  /api|mock|fallback|dispatcher|worker|outbox|mutation|execution|not_configured|operation|submit|fetch failed|failed to fetch|networkerror|econnrefused/i;

const FALSE_SUCCESS_PATTERN =
  /\bolu[sş]turuldu\b|\bkaydedildi\b|\btamamland[ıi]\b|\bgönderildi\b|\bgonderildi\b|\bi[sş]lendi\b/i;

export type QuickOperationSubmitFeedback = {
  notice: string;
  toast: string;
  showApprovalsLink: boolean;
  approvalsHref?: string;
  detailHref?: string;
  detailLabel?: string;
  paymentDetailHref?: string;
  paymentDetailLabel?: string;
};

function containsTechnicalTerms(value: string): boolean {
  return TECHNICAL_PATTERN.test(value) || containsTechnicalUserText(value);
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
      .replace(/\bgonderildi\b/gi, "iletilecek")
      .replace(/\bi[sş]lendi\b/gi, "işlenecek");
  }
  if (containsTechnicalTerms(trimmed)) {
    return MSG_SUBMIT_QUEUED;
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

function resolveApprovalsHref(result: QuickOperationSubmitResponse): string {
  const approvalId = result.approvalId?.trim();
  if (approvalId) {
    return `/onaylar/${approvalId}`;
  }
  return "/onaylar";
}

function resolveDetailLink(
  result: QuickOperationSubmitResponse,
  useDemoData: boolean
): { href: string; label: string } | null {
  if (useDemoData) {
    return null;
  }

  if (result.createdEntityId && result.createdEntityType) {
    const fromEntity = resolveOperationEntityHref(result.createdEntityType, result.createdEntityId);
    if (fromEntity) {
      return fromEntity;
    }
  }

  const documentId = result.documentIds?.[0]?.trim();
  if (documentId) {
    return resolveOperationEntityHref("document", documentId);
  }

  return null;
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
  const approvalsHref = resolveApprovalsHref(result);

  if (options.useDemoData || result.demoPreviewOnly) {
    const notice = [MSG_SUBMIT_DRAFT_READY, refSuffix, MSG_SUBMIT_PREVIEW].filter(Boolean).join(" ");
    return {
      notice,
      toast: notice,
      showApprovalsLink: false
    };
  }

  if (result.mode === "foundation_blocked" || result.mode === "failed") {
    const notice = [MSG_SUBMIT_VALIDATION_FAILED, refSuffix].filter(Boolean).join(" ");
    return {
      notice,
      toast: notice,
      showApprovalsLink: false
    };
  }

  if (result.mode === "queued_for_approval" || result.approvalId?.trim()) {
    const notice = [MSG_SUBMIT_SENT_FOR_APPROVAL, refSuffix, MSG_SUBMIT_AFTER_APPROVAL].filter(Boolean).join(" ");
    return {
      notice,
      toast: [MSG_SUBMIT_SENT_FOR_APPROVAL, MSG_SUBMIT_APPROVALS_HINT].join(" "),
      showApprovalsLink: true,
      approvalsHref
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

  const approvalsLink = {
    showApprovalsLink: true,
    approvalsHref,
    detailHref: detail?.href,
    detailLabel: detail?.label
  };

  if (result.mode === "executed" && result.createdEntityId) {
    const paymentDetail =
      result.createdPaymentId && !options.useDemoData
        ? resolveOperationEntityHref("payment", result.createdPaymentId)
        : null;
    const hasPayment = Boolean(result.paymentRecorded && result.createdPaymentId);
    const notice = hasPayment
      ? [
          "Sipariş ve tahsilat kaydı hazırlandı.",
          refSuffix,
          result.createdPaymentNo ? `Tahsilat: ${result.createdPaymentNo}` : "",
          MSG_SUBMIT_AFTER_APPROVAL
        ]
          .filter(Boolean)
          .join(" ")
      : !result.ok && options.operationType === "sale_order"
        ? ["Sipariş hazırlandı; tahsilat kaydı tamamlanamadı.", refSuffix].filter(Boolean).join(" ")
        : [
            `${segmentLabel(options.operationType)} kaydı hazırlandı.`,
            refSuffix,
            MSG_SUBMIT_AFTER_APPROVAL
          ]
            .filter(Boolean)
            .join(" ");

    return {
      notice,
      toast: hasPayment
        ? "Sipariş ve tahsilat bilgisi işlendi."
        : [MSG_SUBMIT_SENT_FOR_APPROVAL, MSG_SUBMIT_APPROVALS_HINT].join(" "),
      ...approvalsLink,
      paymentDetailHref: paymentDetail?.href,
      paymentDetailLabel: paymentDetail?.label
    };
  }

  const notice = [MSG_SUBMIT_SENT_FOR_APPROVAL, refSuffix, MSG_SUBMIT_QUEUED, MSG_SUBMIT_AFTER_APPROVAL]
    .filter(Boolean)
    .join(" ");

  return {
    notice,
    toast: [MSG_SUBMIT_SENT_FOR_APPROVAL, MSG_SUBMIT_APPROVALS_HINT].join(" "),
    ...approvalsLink
  };
}

function readApiError(error: unknown): { status: number; message: string } | null {
  if (typeof error === "object" && error !== null) {
    const candidate = error as { status?: unknown; message?: unknown };
    if (typeof candidate.status === "number" && typeof candidate.message === "string") {
      return { status: candidate.status, message: candidate.message };
    }
  }
  return null;
}

export function mapSubmitActionError(error: unknown): string {
  if (isOfflineLikeError(error)) {
    return MSG_SUBMIT_NOT_LIVE;
  }

  const httpError = readApiError(error);
  if (httpError) {
    const raw = httpError.message.trim();

    if (httpError.status === 401) {
      return "Oturum süresi doldu. Tekrar giriş yapın.";
    }
    if (httpError.status === 403) {
      return "Bu işlem için yetkiniz yok.";
    }
    if (httpError.status === 404) {
      return "İşlem kaynağı bulunamadı. Cari veya satırları kontrol edin.";
    }
    if (httpError.status === 409) {
      return "Kayıt zaten işlendi veya bu adım tekrarlanamaz.";
    }
    if (httpError.status === 503 || containsTechnicalTerms(raw)) {
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
