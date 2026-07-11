import { ApiError } from "@hallederiz/sdk";

export type SettingsLoadFailureKind = "session" | "generic";

export type SettingsLoadFailure = {
  kind: SettingsLoadFailureKind;
  message: string;
};

const SESSION_RECOVERY_MESSAGE =
  "Oturumunuz sona ermiş veya geçersiz. Ayarları görüntülemek için tekrar giriş yapın.";

function readApiError(error: unknown): { status: number; message: string } | null {
  if (error instanceof ApiError) {
    return { status: error.status, message: error.message };
  }
  if (typeof error === "object" && error !== null) {
    const candidate = error as { status?: unknown; message?: unknown };
    if (typeof candidate.status === "number" && typeof candidate.message === "string") {
      return { status: candidate.status, message: candidate.message };
    }
  }
  return null;
}

function normalizeForMatch(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function looksLikeSessionMessage(message: string): boolean {
  const normalized = normalizeForMatch(message);
  return (
    normalized.includes("oturum gerekli") ||
    normalized.includes("oturum suresi") ||
    normalized.includes("oturum sona") ||
    normalized.includes("missing_session") ||
    normalized.includes("expired_session") ||
    normalized.includes("session_invalid") ||
    normalized.includes("session_expired") ||
    normalized.includes("unauthorized")
  );
}

export function isSettingsSessionError(error: unknown): boolean {
  const httpError = readApiError(error);
  if (httpError?.status === 401) return true;
  if (httpError && looksLikeSessionMessage(httpError.message)) return true;
  if (error instanceof Error && looksLikeSessionMessage(error.message)) return true;
  return false;
}

export function resolveSettingsLoadError(error: unknown, fallbackMessage: string): SettingsLoadFailure {
  if (isSettingsSessionError(error)) {
    return { kind: "session", message: SESSION_RECOVERY_MESSAGE };
  }

  const httpError = readApiError(error);
  if (httpError?.message.trim()) {
    return { kind: "generic", message: httpError.message.trim() };
  }
  if (error instanceof Error && error.message.trim()) {
    return { kind: "generic", message: error.message.trim() };
  }
  return { kind: "generic", message: fallbackMessage };
}

export function buildSettingsLoginHref(returnPath: string): string {
  const safePath = returnPath.startsWith("/") && !returnPath.startsWith("//") ? returnPath : "/dashboard";
  return `/login?next=${encodeURIComponent(safePath)}`;
}
