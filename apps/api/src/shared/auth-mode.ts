export interface AuthMode {
  isProduction: boolean;
  persistenceMode: "demo" | "postgres";
  demoAuthEnabled: boolean;
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
  const allowDemoFallback = demoAuthEnabled && persistenceMode === "demo" && !isProduction;

  return {
    isProduction,
    persistenceMode,
    demoAuthEnabled,
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
