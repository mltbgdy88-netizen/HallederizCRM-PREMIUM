import { ApiDomainError } from "./errors";

export interface PersistencePolicy {
  persistenceMode: string;
  isProduction: boolean;
  demoFallbackAllowed: boolean;
  dbFallbackAllowed: boolean;
  shouldThrowOnDbFailure: boolean;
}

function isEnabled(value: string | undefined): boolean {
  return value === "true";
}

export function getPersistencePolicy(env: NodeJS.ProcessEnv = process.env): PersistencePolicy {
  const persistenceMode = env.PERSISTENCE_MODE ?? "demo";
  const isProduction = env.NODE_ENV === "production";
  const explicitFallbackAllowed = isEnabled(env.ALLOW_DEMO_FALLBACK);
  const demoFallbackAllowed = !isProduction && explicitFallbackAllowed;
  const dbFallbackAllowed = demoFallbackAllowed;

  return {
    persistenceMode,
    isProduction,
    demoFallbackAllowed,
    dbFallbackAllowed,
    shouldThrowOnDbFailure: isProduction || persistenceMode === "postgres" || !dbFallbackAllowed
  };
}

export function buildPersistenceUnavailableError(error: unknown, details?: Record<string, unknown>) {
  return new ApiDomainError("persistence_unavailable", "Veritabani su anda kullanilamiyor. Lutfen baglanti ayarlarini kontrol edin.", {
    reason: "database_operation_failed",
    cause: error instanceof Error ? error.message : String(error),
    ...details
  });
}
