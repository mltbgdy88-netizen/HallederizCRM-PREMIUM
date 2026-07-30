import type { WhatsAppWebLocalConnectionState } from "@hallederiz/types";

export type WhatsAppWebLocalControlSnapshot = {
  state: WhatsAppWebLocalConnectionState;
  reasonCode: string;
  generation: number;
  providerCallExecuted: false;
  checkedAt: string;
};

export type WhatsAppWebLocalClientErrorReasonCode =
  | "session_required"
  | "production_hard_deny"
  | "request_denied"
  | "service_unavailable"
  | "invalid_response"
  | "network_error"
  | "request_aborted";

export class WhatsAppWebLocalControlError extends Error {
  readonly status: number | null;
  readonly reasonCode: WhatsAppWebLocalClientErrorReasonCode;

  constructor(
    status: number | null,
    reasonCode: WhatsAppWebLocalClientErrorReasonCode,
    message: string
  ) {
    super(message);
    this.name = "WhatsAppWebLocalControlError";
    this.status = status;
    this.reasonCode = reasonCode;
  }
}

export type WhatsAppWebLocalControlClient = {
  getStatus(signal?: AbortSignal): Promise<WhatsAppWebLocalControlSnapshot>;
  start(signal?: AbortSignal): Promise<WhatsAppWebLocalControlSnapshot>;
  refreshPairing(signal?: AbortSignal): Promise<WhatsAppWebLocalControlSnapshot>;
  disconnect(signal?: AbortSignal): Promise<WhatsAppWebLocalControlSnapshot>;
  logout(signal?: AbortSignal): Promise<WhatsAppWebLocalControlSnapshot>;
};

const ENDPOINTS = {
  status: "/api/whatsapp-web-local/status",
  start: "/api/whatsapp-web-local/start",
  refresh: "/api/whatsapp-web-local/refresh",
  disconnect: "/api/whatsapp-web-local/disconnect",
  logout: "/api/whatsapp-web-local/logout"
} as const;

const CONNECTION_STATES = new Set<WhatsAppWebLocalConnectionState>([
  "disabled",
  "starting",
  "qr_ready",
  "connecting",
  "connected",
  "reconnecting",
  "logged_out",
  "expired",
  "error"
]);

const SAFE_SUCCESS_REASON_CODES = new Set([
  "whatsapp_web_local_disabled_by_default",
  "whatsapp_web_local_enabled_non_production",
  "whatsapp_web_local_production_hard_deny",
  "whatsapp_web_local_pairing_stub_started",
  "whatsapp_web_local_pairing_stub_refreshed",
  "whatsapp_web_local_refresh_not_allowed",
  "whatsapp_web_local_disconnected",
  "whatsapp_web_local_logged_out",
  "whatsapp_web_local_invalid_state_transition",
  "whatsapp_web_local_state_updated"
]);

const SAFE_SNAPSHOT_KEYS = new Set([
  "state",
  "reasonCode",
  "generation",
  "providerCallExecuted",
  "checkedAt"
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeSnapshot(payload: unknown): WhatsAppWebLocalControlSnapshot {
  if (!isRecord(payload)) {
    throw invalidResponseError();
  }

  const payloadKeys = Object.keys(payload);
  if (
    payloadKeys.length !== SAFE_SNAPSHOT_KEYS.size ||
    payloadKeys.some((key) => !SAFE_SNAPSHOT_KEYS.has(key))
  ) {
    throw invalidResponseError();
  }

  const { state, reasonCode, generation, providerCallExecuted, checkedAt } = payload;
  if (
    typeof state !== "string" ||
    !CONNECTION_STATES.has(state as WhatsAppWebLocalConnectionState) ||
    typeof reasonCode !== "string" ||
    reasonCode.length === 0 ||
    reasonCode !== reasonCode.trim() ||
    !SAFE_SUCCESS_REASON_CODES.has(reasonCode) ||
    !Number.isSafeInteger(generation) ||
    (generation as number) < 0 ||
    providerCallExecuted !== false ||
    typeof checkedAt !== "string" ||
    checkedAt.length === 0 ||
    checkedAt.length > 64 ||
    checkedAt !== checkedAt.trim() ||
    !Number.isFinite(Date.parse(checkedAt))
  ) {
    throw invalidResponseError();
  }

  return {
    state: state as WhatsAppWebLocalConnectionState,
    reasonCode,
    generation: generation as number,
    providerCallExecuted: false,
    checkedAt
  };
}

function invalidResponseError(): WhatsAppWebLocalControlError {
  return new WhatsAppWebLocalControlError(
    null,
    "invalid_response",
    "Yerel bağlantı servisinden güvenli bir yanıt alınamadı."
  );
}

function hasJsonMediaType(response: Response): boolean {
  const contentType = response.headers.get("Content-Type");
  if (!contentType) {
    return false;
  }

  const [mediaType] = contentType.split(";", 1);
  const normalized = mediaType?.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  return (
    normalized === "application/json" ||
    /^application\/[a-z0-9!#$&^_.+-]+\+json$/i.test(normalized)
  );
}

async function readJson(response: Response): Promise<unknown> {
  if (!hasJsonMediaType(response)) {
    throw invalidResponseError();
  }

  try {
    return await response.json();
  } catch {
    throw invalidResponseError();
  }
}

async function isProductionHardDeny(response: Response): Promise<boolean> {
  if (response.status !== 403 || !hasJsonMediaType(response)) {
    return false;
  }

  try {
    const snapshot = sanitizeSnapshot(await readJson(response));
    return (
      snapshot.state === "disabled" &&
      snapshot.reasonCode === "whatsapp_web_local_production_hard_deny"
    );
  } catch {
    return false;
  }
}

async function toHttpError(response: Response): Promise<WhatsAppWebLocalControlError> {
  if (response.status === 401) {
    return new WhatsAppWebLocalControlError(
      401,
      "session_required",
      "Oturumunuz doğrulanamadı. Yeniden giriş yaptıktan sonra durumu tekrar kontrol edin."
    );
  }

  if (await isProductionHardDeny(response)) {
    return new WhatsAppWebLocalControlError(
      403,
      "production_hard_deny",
      "Production ortamında yerel bağlantı kapalıdır. Resmi production yolu Meta WhatsApp Cloud API'dir."
    );
  }

  if (response.status === 403) {
    return new WhatsAppWebLocalControlError(
      403,
      "request_denied",
      "Bu yerel bağlantı işlemi için gerekli yetkiniz bulunmuyor."
    );
  }

  if (response.status >= 500) {
    return new WhatsAppWebLocalControlError(
      response.status,
      "service_unavailable",
      "Yerel bağlantı servisine şu anda ulaşılamıyor."
    );
  }

  return new WhatsAppWebLocalControlError(
    response.status,
    "request_denied",
    "Yerel bağlantı isteği güvenli biçimde reddedildi."
  );
}

function toTransportError(error: unknown): WhatsAppWebLocalControlError {
  if (error instanceof WhatsAppWebLocalControlError) {
    return error;
  }
  if (
    (error instanceof DOMException && error.name === "AbortError") ||
    (isRecord(error) && error.name === "AbortError")
  ) {
    return new WhatsAppWebLocalControlError(
      null,
      "request_aborted",
      "Yerel bağlantı isteği iptal edildi."
    );
  }
  return new WhatsAppWebLocalControlError(
    null,
    "network_error",
    "Yerel bağlantı servisine güvenli istek gönderilemedi."
  );
}

async function requestSnapshot(
  fetchImpl: typeof fetch,
  endpoint: (typeof ENDPOINTS)[keyof typeof ENDPOINTS],
  method: "GET" | "POST",
  signal?: AbortSignal
): Promise<WhatsAppWebLocalControlSnapshot> {
  let response: Response;
  try {
    response = await fetchImpl(endpoint, {
      method,
      credentials: "same-origin",
      cache: "no-store",
      redirect: "error",
      signal
    });
  } catch (error) {
    throw toTransportError(error);
  }

  if (!response.ok) {
    throw await toHttpError(response);
  }

  return sanitizeSnapshot(await readJson(response));
}

export function createWhatsAppWebLocalControlClient(
  fetchImpl: typeof fetch = (...args) => fetch(...args)
): WhatsAppWebLocalControlClient {
  return {
    getStatus: (signal) => requestSnapshot(fetchImpl, ENDPOINTS.status, "GET", signal),
    start: (signal) => requestSnapshot(fetchImpl, ENDPOINTS.start, "POST", signal),
    refreshPairing: (signal) =>
      requestSnapshot(fetchImpl, ENDPOINTS.refresh, "POST", signal),
    disconnect: (signal) =>
      requestSnapshot(fetchImpl, ENDPOINTS.disconnect, "POST", signal),
    logout: (signal) => requestSnapshot(fetchImpl, ENDPOINTS.logout, "POST", signal)
  };
}

export const whatsappWebLocalControlClient = createWhatsAppWebLocalControlClient();
