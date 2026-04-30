export interface AuthMode {
  isProduction: boolean;
  persistenceMode: "demo" | "postgres";
  demoAuthEnabled: boolean;
  localPilotAuthEnabled: boolean;
  canUseLocalPilotAuth: boolean;
  localPilotAuthConfigured: boolean;
  localPilotAuthEmail?: string;
  localPilotAuthPassword?: string;
  localPilotAuthRole: string;
  allowMockAccessTokens: boolean;
  allowHeaderPrincipalFallback: boolean;
}

function isEnabled(value: string | undefined): boolean {
  return value === "true";
}

export function getAuthMode(): AuthMode {
  const isProduction = process.env.NODE_ENV === "production";
  const persistenceMode = process.env.PERSISTENCE_MODE === "postgres" ? "postgres" : "demo";
  const demoAuthEnabled = isEnabled(process.env.DEMO_AUTH_ENABLED) && !isProduction;
  const localPilotAuthEnabled = isEnabled(process.env.LOCAL_PILOT_AUTH_ENABLED) && !isProduction;
  const localPilotAuthEmail = process.env.LOCAL_PILOT_AUTH_EMAIL?.trim();
  const localPilotAuthPassword = process.env.LOCAL_PILOT_AUTH_PASSWORD?.trim();
  const localPilotAuthRole = process.env.LOCAL_PILOT_AUTH_ROLE?.trim() || "admin";
  const localPilotAuthConfigured = Boolean(localPilotAuthEmail && localPilotAuthPassword);
  const canUseLocalPilotAuth = localPilotAuthEnabled && localPilotAuthConfigured;
  const allowDemoFallback = demoAuthEnabled && persistenceMode === "demo" && !isProduction;

  return {
    isProduction,
    persistenceMode,
    demoAuthEnabled,
    localPilotAuthEnabled,
    canUseLocalPilotAuth,
    localPilotAuthConfigured,
    localPilotAuthEmail,
    localPilotAuthPassword,
    localPilotAuthRole,
    allowMockAccessTokens: allowDemoFallback,
    allowHeaderPrincipalFallback: allowDemoFallback
  };
}

export function assertDemoAuthAllowed() {
  const mode = getAuthMode();
  if (!mode.demoAuthEnabled || mode.persistenceMode !== "demo") {
    throw new Error("Demo auth disabled. Configure real auth provider.");
  }
}
