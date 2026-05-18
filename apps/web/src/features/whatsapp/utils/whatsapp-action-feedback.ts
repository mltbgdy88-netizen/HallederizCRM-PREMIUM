import {
  MSG_WA_CONNECTION_NOT_LIVE,
  MSG_WA_CONVERSATION_NOT_FOUND,
  MSG_WA_CUSTOMER_HISTORY_MISSING,
  MSG_WA_DETAIL_FAILED,
  MSG_WA_LIST_FAILED
} from "../data/whatsapp-action-messages";

const TECHNICAL_PATTERN =
  /api|mock|fallback|dispatcher|worker|outbox|mutation|execution|not_configured|webhook|adapter|queue|gateway/i;

const FALSE_SUCCESS_PATTERN =
  /\bgönderildi\b|\bgonderildi\b|\biletildi\b|\bbağlandı\b|\bbaglandi\b|\baktif edildi\b|\bolu[sş]turuldu\b/i;

export function containsTechnicalWhatsAppTerms(value: string): boolean {
  return TECHNICAL_PATTERN.test(value);
}

export function containsFalseWhatsAppSuccessTerms(value: string): boolean {
  return FALSE_SUCCESS_PATTERN.test(value);
}

export function sanitizeWhatsAppUserText(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }
  if (containsFalseWhatsAppSuccessTerms(trimmed)) {
    return trimmed
      .replace(/\bolu[sş]turuldu\b/gi, "hazırlandı")
      .replace(/\bgönderildi\b/gi, "iletilecek")
      .replace(/\bgonderildi\b/gi, "iletilecek")
      .replace(/\biletildi\b/gi, "iletilecek")
      .replace(/\bbağlandı\b/gi, "bağlantı bekleniyor")
      .replace(/\bbaglandi\b/gi, "bağlantı bekleniyor")
      .replace(/\baktif edildi\b/gi, "henüz bağlı değil");
  }
  if (containsTechnicalWhatsAppTerms(trimmed)) {
    return MSG_WA_CONNECTION_NOT_LIVE;
  }
  return trimmed;
}

function readHttpError(error: unknown): { status: number; message: string } | null {
  if (typeof error !== "object" || error === null) {
    return null;
  }
  const candidate = error as { status?: unknown; message?: unknown };
  if (typeof candidate.status === "number" && typeof candidate.message === "string") {
    return { status: candidate.status, message: candidate.message };
  }
  return null;
}

export function mapWhatsAppActionError(error: unknown): string {
  const httpError = readHttpError(error);
  if (httpError) {
    const raw = httpError.message.trim();

    if (httpError.status === 401) {
      return "Oturum süresi doldu. Tekrar giriş yapın.";
    }
    if (httpError.status === 403) {
      return "Bu işlem için yetkiniz yok.";
    }
    if (httpError.status === 404) {
      return MSG_WA_CONVERSATION_NOT_FOUND;
    }
    if (httpError.status === 409) {
      return "Kayıt zaten işlendi veya bu adım tekrarlanamaz.";
    }
    if (httpError.status === 503 || containsTechnicalWhatsAppTerms(raw)) {
      return MSG_WA_CONNECTION_NOT_LIVE;
    }
    if (raw && !containsTechnicalWhatsAppTerms(raw) && !containsFalseWhatsAppSuccessTerms(raw)) {
      return raw;
    }
    return MSG_WA_LIST_FAILED;
  }

  if (error instanceof Error) {
    const raw = error.message.trim();
    if (raw && !containsTechnicalWhatsAppTerms(raw) && !containsFalseWhatsAppSuccessTerms(raw)) {
      return raw;
    }
  }

  return MSG_WA_LIST_FAILED;
}

export function mapWhatsAppDetailError(error: unknown): string {
  const mapped = mapWhatsAppActionError(error);
  if (mapped === MSG_WA_LIST_FAILED) {
    return MSG_WA_DETAIL_FAILED;
  }
  return mapped;
}

export function resolveCustomerEmptyMessage(hasCustomerFilter: boolean): string {
  if (hasCustomerFilter) {
    return MSG_WA_CUSTOMER_HISTORY_MISSING;
  }
  return MSG_WA_CONVERSATION_NOT_FOUND;
}
