export const MSG_DATA_UNAVAILABLE = "Canlı veri şu anda alınamıyor.";
export const MSG_DATA_WHEN_RECONNECTED = "Bağlantı tekrar kurulduğunda bilgiler yenilenecek.";
export const MSG_DATA_NOT_FOUND_OR_UNAVAILABLE = "Kayıt bulunamadı veya veri kaynağına ulaşılamıyor.";
export const MSG_LIVE_CONNECTION_REQUIRED = "Bu işlem için canlı bağlantı gerekir.";
export const MSG_REFRESH_RETRY = "Sayfayı yenileyerek tekrar deneyebilirsiniz.";
export const MSG_LOGIN_UNAVAILABLE =
  "Sunucuya şu an ulaşılamıyor. Bağlantınızı kontrol edip tekrar deneyin.";

const TECHNICAL_PATTERN =
  /fetch failed|failed to fetch|networkerror|econnrefused|enotfound|etimedout|socket hang up|aborterror|cors|http:\/\/|https:\/\/|localhost:\d+/i;

const INTERNAL_TERM_PATTERN =
  /api|mock|fallback|dispatcher|worker|outbox|mutation|execution|not_configured|stack trace/i;

export function containsTechnicalUserText(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  return TECHNICAL_PATTERN.test(trimmed) || INTERNAL_TERM_PATTERN.test(trimmed);
}

export function isOfflineLikeError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return true;
  }
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  return /fetch|network|econnrefused|failed to fetch|socket|timeout|aborted|unreachable/i.test(raw);
}

export function mapUserFacingDataError(error?: unknown, fallback = MSG_DATA_UNAVAILABLE): string {
  if (error === undefined || error === null) {
    return fallback;
  }
  if (isOfflineLikeError(error)) {
    return MSG_DATA_UNAVAILABLE;
  }
  const raw = error instanceof Error ? error.message.trim() : String(error).trim();
  if (!raw || containsTechnicalUserText(raw)) {
    return fallback;
  }
  return raw;
}

export function mapUserFacingLoginError(options: {
  networkError: boolean;
  serverMessage?: string | null;
}): string {
  if (options.networkError) {
    return MSG_LOGIN_UNAVAILABLE;
  }
  const raw = options.serverMessage?.trim();
  if (raw && !containsTechnicalUserText(raw)) {
    return raw;
  }
  return "Giriş yapılamadı. Bilgilerinizi kontrol edip tekrar deneyin.";
}

