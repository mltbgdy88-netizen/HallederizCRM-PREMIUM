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

const STORAGE_KEY = "hz_platform_session";
const ACCESS_TOKEN_STORAGE_KEY = "hz_platform_access_token";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredSession(): SessionModel | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const session = JSON.parse(raw) as SessionModel;
    return isSessionActive(session) ? session : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>("loading");
  const [session, setSession] = useState<SessionModel | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const hydrateSession = async () => {
      const storedSession = readStoredSession();
      const storedToken = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
      if (!storedSession || !storedToken) {
        setSession(null);
        setAccessToken(null);
        setState("anonymous");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/session`, {
          headers: {
            "x-session-token": storedToken,
            authorization: `Bearer ${storedToken}`
          },
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("session_invalid");
        }

        const payload = (await response.json()) as { item: SessionModel };
        setSession(payload.item);
        setAccessToken(storedToken);
        setState("authenticated");
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
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

    let loginResponse = null as Awaited<ReturnType<typeof fetch>> | null;
    try {
      loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input)
      });
    } catch {
      loginResponse = null;
    }

    const payload =
      loginResponse && loginResponse.ok
        ? ((await loginResponse.json()) as { session: SessionModel; accessToken: string })
        : createMockLoginResponse(input, defaultTenant, defaultUser, [adminRole]);

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload.session));
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, payload.accessToken);
    setSession(payload.session);
    setAccessToken(payload.accessToken);
    setState("authenticated");

    return { success: true };
  };

  const logout = (): void => {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
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
