"use client";

import { createMockLoginResponse, isSessionActive } from "@hallederiz/domain";
import type { AuthState, LoginInput, SessionModel } from "@hallederiz/types";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { adminRole, defaultTenant, defaultUser } from "../lib/platform-mocks";

interface LoginResult {
  success: boolean;
  message?: string;
}

interface AuthContextValue {
  state: AuthState;
  session: SessionModel | null;
  accessToken: string | null;
  login: (input: LoginInput) => Promise<LoginResult>;
  logout: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
const ENABLE_DEMO_AUTH =
  process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === "true";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>("loading");
  const [session, setSession] = useState<SessionModel | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/session`, {
          credentials: "include",
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("session_invalid");
        }

        const payload = (await response.json()) as { item: SessionModel };
        if (isSessionActive(payload.item)) {
          setSession(payload.item);
          setAccessToken(null);
          setState("authenticated");
          return;
        }
        throw new Error("session_expired");
      } catch {
        setSession(null);
        setAccessToken(null);
        setState("anonymous");
      }
    };

    void hydrateSession();
  }, []);

  const login = async (input: LoginInput): Promise<LoginResult> => {
    if (!input.email || !input.password || !input.tenantSlug) {
      return {
        success: false,
        message: "Lutfen tenant, e-posta ve parola alanlarini doldurun."
      };
    }

    let loginResponse = null as Response | null;
    let networkError = false;
    try {
      loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
        credentials: "include"
      });
    } catch {
      loginResponse = null;
      networkError = true;
    }

    if (!loginResponse?.ok && !ENABLE_DEMO_AUTH) {
      let message = networkError
        ? `API'ye ulasilamadi (${API_BASE_URL}). API sunucusunun calistigini ve CORS ayarlarini kontrol edin.`
        : "Giris yapilamadi. Lutfen auth saglayici ayarlarini kontrol edin.";
      try {
        const errorPayload = loginResponse ? ((await loginResponse.json()) as { message?: string }) : null;
        message = errorPayload?.message ?? message;
      } catch {
        // Keep the user-facing fallback message.
      }
      return {
        success: false,
        message
      };
    }

    const payload =
      loginResponse && loginResponse.ok
        ? ((await loginResponse.json()) as { session: SessionModel; accessToken: string })
        : createMockLoginResponse(input, defaultTenant, defaultUser, [adminRole]);

    setSession(payload.session);
    setAccessToken(ENABLE_DEMO_AUTH && !loginResponse?.ok ? payload.accessToken : null);
    setState("authenticated");

    return { success: true };
  };

  const logout = (): void => {
    void fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
      cache: "no-store"
    }).catch(() => undefined);
    setSession(null);
    setAccessToken(null);
    setState("anonymous");
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      session,
      accessToken,
      login,
      logout
    }),
    [state, session, accessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
