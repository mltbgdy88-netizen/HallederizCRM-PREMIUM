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
  login: (input: LoginInput) => Promise<LoginResult>;
  logout: () => void;
}

const STORAGE_KEY = "hz_platform_session";

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

  useEffect(() => {
    const storedSession = readStoredSession();
    if (storedSession) {
      setSession(storedSession);
      setState("authenticated");
      return;
    }

    setSession(null);
    setState("anonymous");
  }, []);

  const login = async (input: LoginInput): Promise<LoginResult> => {
    if (!input.email || !input.password || !input.tenantSlug) {
      return {
        success: false,
        message: "Lutfen tenant, e-posta ve parola alanlarini doldurun."
      };
    }

    // TODO: Replace this with a real call to POST /auth/login.
    const loginResponse = createMockLoginResponse(input, defaultTenant, defaultUser, [adminRole]);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loginResponse.session));
    setSession(loginResponse.session);
    setState("authenticated");

    return { success: true };
  };

  const logout = (): void => {
    window.localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setState("anonymous");
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      session,
      login,
      logout
    }),
    [state, session]
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
