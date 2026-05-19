import { isSessionActive } from "@hallederiz/domain";
import type { SessionModel } from "@hallederiz/types";

const STORAGE_KEY = "hallederiz.crm.demo-session";

export type PersistedDemoAuth = {
  session: SessionModel;
  accessToken: string | null;
};

export function isDemoAuthEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === "true";
}

export function readPersistedDemoAuth(): PersistedDemoAuth | null {
  if (!isDemoAuthEnabled() || typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<PersistedDemoAuth>;
    if (!parsed.session || !isSessionActive(parsed.session)) {
      clearPersistedDemoAuth();
      return null;
    }

    return {
      session: parsed.session,
      accessToken: typeof parsed.accessToken === "string" ? parsed.accessToken : null
    };
  } catch {
    clearPersistedDemoAuth();
    return null;
  }
}

export function writePersistedDemoAuth(session: SessionModel, accessToken: string | null): void {
  if (!isDemoAuthEnabled() || typeof window === "undefined") {
    return;
  }

  const payload: PersistedDemoAuth = { session, accessToken };
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearPersistedDemoAuth(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.removeItem(STORAGE_KEY);
}
