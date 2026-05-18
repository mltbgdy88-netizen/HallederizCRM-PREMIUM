import type { Document } from "@hallederiz/types";
import { ApiError } from "@hallederiz/sdk";
import { sdk } from "../../../lib/data-source";
import {
  MSG_DOC_ACTION_FAILED,
  MSG_DOC_ARCHIVE_NEED_LINK,
  MSG_DOC_ARCHIVE_QUEUE,
  MSG_DOC_CUSTOMER_PREVIEW_MISSING,
  MSG_DOC_DOWNLOAD_NOT_LIVE,
  MSG_DOC_EMAIL_NOT_LIVE,
  MSG_DOC_NOT_FOUND,
  MSG_DOC_PDF_NOT_LIVE,
  MSG_DOC_PDF_QUEUE,
  MSG_DOC_PREVIEW_ONLY,
  MSG_DOC_PRINT_QUEUE,
  MSG_DOC_QUEUE_NOT_LIVE,
  MSG_DOC_SEND_QUEUE,
  MSG_DOC_WHATSAPP_NEED_LINK
} from "../data/document-action-messages";

const TECHNICAL_PATTERN =
  /api|mock|fallback|dispatcher|worker|outbox|mutation|execution|not_configured|adapter|queue/i;

const FALSE_SUCCESS_PATTERN =
  /\bolu[sş]turuldu\b|\bkaydedildi\b|\btamamland[ıi]\b|\bgönderildi\b|\bgonderildi\b|\bindirildi\b|\bar[sş]ivlendi\b/i;

export type DocumentLiveAction = "regenerate" | "sendWhatsApp" | "sendEmail" | "queueSave" | "queuePrint";

export function hasDownloadablePdf(_document: Document | null): boolean {
  return false;
}

function containsTechnicalTerms(value: string): boolean {
  return TECHNICAL_PATTERN.test(value);
}

function containsFalseSuccessTerms(value: string): boolean {
  return FALSE_SUCCESS_PATTERN.test(value);
}

export function sanitizeDocumentUserText(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }
  if (containsFalseSuccessTerms(trimmed)) {
    return trimmed
      .replace(/\bolu[sş]turuldu\b/gi, "hazırlandı")
      .replace(/\bekstre olu[sş]turuldu\b/gi, "ekstre taslağı hazırlandı")
      .replace(/\bbelge kaydedildi\b/gi, "belge taslağı hazırlandı")
      .replace(/\bkaydedildi\b/gi, "hazırlandı")
      .replace(/\bindirildi\b/gi, "indirilecek")
      .replace(/\bar[sş]ivlendi\b/gi, "arşive aktarılacak")
      .replace(/\bgönderildi\b/gi, "iletilecek")
      .replace(/\bgonderildi\b/gi, "iletilecek");
  }
  if (containsTechnicalTerms(trimmed)) {
    return MSG_DOC_QUEUE_NOT_LIVE;
  }
  return trimmed;
}

export function mapDocumentActionError(error: unknown): string {
  if (error instanceof ApiError) {
    const raw = error.message.trim();

    if (error.status === 401) {
      return "Oturum süresi doldu. Tekrar giriş yapın.";
    }
    if (error.status === 403) {
      return "Bu işlem için yetkiniz yok.";
    }
    if (error.status === 404) {
      return MSG_DOC_NOT_FOUND;
    }
    if (error.status === 409) {
      return "Kayıt zaten işlendi veya bu adım tekrarlanamaz.";
    }
    if (error.status === 503 || containsTechnicalTerms(raw)) {
      return MSG_DOC_QUEUE_NOT_LIVE;
    }
    if (raw && !containsTechnicalTerms(raw) && !containsFalseSuccessTerms(raw)) {
      return raw;
    }
    return MSG_DOC_ACTION_FAILED;
  }

  if (error instanceof Error) {
    const raw = error.message.trim();
    if (raw && !containsTechnicalTerms(raw) && !containsFalseSuccessTerms(raw)) {
      return raw;
    }
  }

  return MSG_DOC_ACTION_FAILED;
}

export function resolveDemoActionToasts(action: DocumentLiveAction | "download"): string[] {
  switch (action) {
    case "sendWhatsApp":
      return [MSG_DOC_WHATSAPP_NEED_LINK, MSG_DOC_PREVIEW_ONLY];
    case "sendEmail":
      return [MSG_DOC_EMAIL_NOT_LIVE, MSG_DOC_PREVIEW_ONLY];
    case "regenerate":
      return [MSG_DOC_PDF_NOT_LIVE, MSG_DOC_PREVIEW_ONLY];
    case "queueSave":
      return [MSG_DOC_ARCHIVE_NEED_LINK, MSG_DOC_PREVIEW_ONLY];
    case "queuePrint":
      return [MSG_DOC_QUEUE_NOT_LIVE, MSG_DOC_PREVIEW_ONLY];
    case "download":
      return [MSG_DOC_DOWNLOAD_NOT_LIVE, MSG_DOC_PREVIEW_ONLY];
    default:
      return [MSG_DOC_PREVIEW_ONLY];
  }
}

export function resolveLiveSuccessToast(action: DocumentLiveAction): string {
  switch (action) {
    case "regenerate":
      return MSG_DOC_PDF_QUEUE;
    case "sendWhatsApp":
    case "sendEmail":
      return MSG_DOC_SEND_QUEUE;
    case "queueSave":
      return MSG_DOC_ARCHIVE_QUEUE;
    case "queuePrint":
      return MSG_DOC_PRINT_QUEUE;
    default:
      return MSG_DOC_QUEUE_NOT_LIVE;
  }
}

export async function runDocumentLiveAction(
  action: DocumentLiveAction,
  documentId: string,
  options: { useDemoData: boolean }
): Promise<{ ok: boolean; toasts: string[] }> {
  if (options.useDemoData) {
    return { ok: false, toasts: resolveDemoActionToasts(action) };
  }

  try {
    if (action === "regenerate") {
      await sdk.documents.regenerate(documentId);
    } else if (action === "sendWhatsApp") {
      await sdk.documents.sendWhatsApp(documentId);
    } else if (action === "sendEmail") {
      await sdk.documents.sendEmail(documentId);
    } else if (action === "queueSave") {
      await sdk.documents.queueSave(documentId);
    } else if (action === "queuePrint") {
      await sdk.documents.queuePrint(documentId);
    }
    return { ok: true, toasts: [resolveLiveSuccessToast(action)] };
  } catch (error) {
    return { ok: false, toasts: [mapDocumentActionError(error)] };
  }
}

export function resolveDocumentsEmptyMessage(options: {
  useDemoData: boolean;
  customerId: string | null;
  typeFilter: string | null;
}): string {
  if (options.useDemoData) {
    return "Filtrelere uygun örnek belge bulunamadı.";
  }
  if (options.customerId && options.typeFilter === "statement_pdf") {
    return MSG_DOC_CUSTOMER_PREVIEW_MISSING;
  }
  if (options.customerId) {
    return MSG_DOC_CUSTOMER_PREVIEW_MISSING;
  }
  return MSG_DOC_NOT_FOUND;
}
