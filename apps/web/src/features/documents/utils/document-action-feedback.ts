import type { Document } from "@hallederiz/types";
import { containsTechnicalUserText, isOfflineLikeError } from "../../../lib/user-facing-data-error";
import {
  MSG_DOC_ACTION_FAILED,
  MSG_DOC_ARCHIVE_NEED_LINK,
  MSG_DOC_ARCHIVE_QUEUE,
  MSG_DOC_CUSTOMER_PREVIEW_MISSING,
  MSG_DOC_DOWNLOAD_NOT_LIVE,
  MSG_DOC_DOWNLOAD_NOT_READY,
  MSG_DOC_DOWNLOAD_UNAVAILABLE,
  MSG_DOC_EMAIL_NOT_LIVE,
  MSG_DOC_NOT_FOUND,
  MSG_DOC_PDF_NOT_LIVE,
  MSG_DOC_PDF_QUEUE,
  MSG_DOC_PDF_READY_HINT,
  MSG_DOC_PREVIEW_ONLY,
  MSG_DOC_PRINT_QUEUE,
  MSG_DOC_QUEUE_NOT_LIVE,
  MSG_DOC_SEND_QUEUE,
  MSG_DOC_WHATSAPP_NEED_LINK
} from "../data/document-action-messages";
import {
  extractDownloadUrlFromDocument,
  extractDownloadUrlFromLink,
  extractDownloadUrlFromRecord,
  findLatestDelivery,
  hasDownloadablePdf,
  resolveDocumentDownloadUserMessage
} from "./document-delivery-utils";

const TECHNICAL_PATTERN =
  /api|mock|fallback|dispatcher|worker|outbox|mutation|execution|not_configured|adapter|queue|fetch failed|failed to fetch|networkerror|econnrefused/i;

const FALSE_SUCCESS_PATTERN =
  /\bolu[sş]turuldu\b|\bkaydedildi\b|\btamamland[ıi]\b|\bgönderildi\b|\bgonderildi\b|\bindirildi\b|\bar[sş]ivlendi\b/i;

export type DocumentLiveAction = "regenerate" | "sendWhatsApp" | "sendEmail" | "queueSave" | "queuePrint";

export type DocumentActionOutcome = {
  ok: boolean;
  toasts: string[];
  document?: Document;
  downloadUrl?: string | null;
};

export { hasDownloadablePdf, extractDownloadUrlFromDocument };

function containsTechnicalTerms(value: string): boolean {
  return TECHNICAL_PATTERN.test(value) || containsTechnicalUserText(value);
}

function containsFalseSuccessTerms(value: string): boolean {
  return FALSE_SUCCESS_PATTERN.test(value);
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
  if (isOfflineLikeError(error)) {
    return MSG_DOC_QUEUE_NOT_LIVE;
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
      return MSG_DOC_NOT_FOUND;
    }
    if (httpError.status === 202) {
      return resolveDocumentDownloadUserMessage({ httpStatus: 202 });
    }
    if (httpError.status === 409) {
      return "Kayıt zaten işlendi veya bu adım tekrarlanamaz.";
    }
    if (httpError.status === 503 || containsTechnicalTerms(raw)) {
      return MSG_DOC_QUEUE_NOT_LIVE;
    }
    if (raw && !containsTechnicalTerms(raw) && !containsFalseSuccessTerms(raw)) {
      return sanitizeDocumentUserText(raw);
    }
    return MSG_DOC_ACTION_FAILED;
  }

  if (error instanceof Error) {
    const raw = error.message.trim();
    if (raw && !containsTechnicalTerms(raw) && !containsFalseSuccessTerms(raw)) {
      return sanitizeDocumentUserText(raw);
    }
  }

  return MSG_DOC_ACTION_FAILED;
}

function resolveSendChannelToast(document: Document, channel: "whatsapp" | "email"): string {
  const delivery = findLatestDelivery(document, channel);
  if (!delivery) {
    return MSG_DOC_SEND_QUEUE;
  }
  if (delivery.status === "delivered") {
    return "İletim tamamlandı.";
  }
  if (delivery.status === "failed") {
    return "İletim tamamlanamadı. Belge ekranından tekrar deneyin.";
  }
  return MSG_DOC_SEND_QUEUE;
}

function resolveLiveSuccessToasts(action: DocumentLiveAction, document?: Document): string[] {
  switch (action) {
    case "regenerate":
      return [MSG_DOC_PDF_QUEUE, MSG_DOC_PDF_READY_HINT];
    case "sendWhatsApp":
      return document ? [resolveSendChannelToast(document, "whatsapp")] : [MSG_DOC_SEND_QUEUE];
    case "sendEmail":
      return document ? [resolveSendChannelToast(document, "email")] : [MSG_DOC_SEND_QUEUE];
    case "queueSave":
      return [MSG_DOC_ARCHIVE_QUEUE];
    case "queuePrint":
      return [MSG_DOC_PRINT_QUEUE];
    default:
      return [MSG_DOC_QUEUE_NOT_LIVE];
  }
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

export async function fetchDocumentDownloadLink(
  documentId: string,
  options: { useDemoData: boolean }
): Promise<{ ok: boolean; downloadUrl: string | null; message: string }> {
  if (options.useDemoData) {
    return { ok: false, downloadUrl: null, message: MSG_DOC_DOWNLOAD_NOT_LIVE };
  }

  try {
    const { sdk } = await import("../../../lib/data-source");
    const response = await sdk.documents.getDownloadUrl(documentId);
    const url = extractDownloadUrlFromLink(response.item);
    if (response.status === 200 && url) {
      return { ok: true, downloadUrl: url, message: "" };
    }
    return {
      ok: false,
      downloadUrl: null,
      message: resolveDocumentDownloadUserMessage({ httpStatus: response.status, link: response.item })
    };
  } catch (error) {
    if (readApiError(error)?.status === 404) {
      return { ok: false, downloadUrl: null, message: MSG_DOC_DOWNLOAD_NOT_READY };
    }
    if (isOfflineLikeError(error)) {
      return { ok: false, downloadUrl: null, message: MSG_DOC_DOWNLOAD_UNAVAILABLE };
    }
    return { ok: false, downloadUrl: null, message: mapDocumentActionError(error) };
  }
}

export async function runDocumentLiveAction(
  action: DocumentLiveAction,
  documentId: string,
  options: { useDemoData: boolean }
): Promise<DocumentActionOutcome> {
  if (options.useDemoData) {
    return { ok: false, toasts: resolveDemoActionToasts(action) };
  }

  try {
    const { sdk } = await import("../../../lib/data-source");
    let document: Document | undefined;
    let downloadUrl: string | null = null;

    if (action === "regenerate") {
      const response = await sdk.documents.regenerate(documentId);
      document = response.item;
      downloadUrl = extractDownloadUrlFromDocument(document) ?? extractDownloadUrlFromRecord(response.item as unknown as Record<string, unknown>);
    } else if (action === "sendWhatsApp") {
      const response = await sdk.documents.sendWhatsApp(documentId);
      document = response.item;
    } else if (action === "sendEmail") {
      const response = await sdk.documents.sendEmail(documentId);
      document = response.item;
    } else if (action === "queueSave") {
      const response = await sdk.documents.queueSave(documentId);
      downloadUrl = extractDownloadUrlFromRecord(response.item as unknown as Record<string, unknown>);
    } else if (action === "queuePrint") {
      await sdk.documents.queuePrint(documentId);
    }

    return {
      ok: true,
      toasts: resolveLiveSuccessToasts(action, document),
      document,
      downloadUrl: downloadUrl ?? (document ? extractDownloadUrlFromDocument(document) : null)
    };
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
