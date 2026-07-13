export type SettingsLoadFailureKind = "session" | "generic";

export type SettingsLoadFailure = {
  kind: SettingsLoadFailureKind;
  message: string;
};

export const SETTINGS_SESSION_RECOVERY_COPY = {
  title: "Oturum doğrulanamadı",
  message: "Oturumunuz sona ermiş veya geçersiz. Ayarları görüntülemek için tekrar giriş yapın.",
  loginAction: "Tekrar giriş yap",
  retryAction: "Tekrar dene",
  retryingAction: "Deneniyor…"
} as const;

function readApiError(error: unknown): { status: number; message: string } | null {
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
    normalized.includes("session_expired")
  );
}

export function isSettingsSessionError(error: unknown): boolean {
  const httpError = readApiError(error);
  if (httpError?.status === 401) return true;
  if (httpError) return looksLikeSessionMessage(httpError.message);
  if (error instanceof Error && looksLikeSessionMessage(error.message)) return true;
  return false;
}

export function resolveSettingsLoadError(error: unknown, fallbackMessage: string): SettingsLoadFailure {
  if (isSettingsSessionError(error)) {
    return { kind: "session", message: SETTINGS_SESSION_RECOVERY_COPY.message };
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
