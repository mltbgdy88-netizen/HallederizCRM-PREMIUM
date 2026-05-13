import { tenantUsageLedger, type TenantUsageLedger } from "@hallederiz/domain";
import { createQueryExecutor, DatabaseTenantUsageLedger } from "@hallederiz/database";
import { getAuthMode } from "./auth-mode";
import type { RequestContext } from "./request-context";

export type TenantUsagePersistenceMode = "memory" | "postgres" | "unsupported";

export interface TenantUsageLedgerResolution {
  ledger: TenantUsageLedger | null;
  mode: TenantUsagePersistenceMode;
  skipped: boolean;
  reasons: string[];
}

let cachedPostgresLedger: TenantUsageLedger | null = null;
let cachedPostgresUrl: string | null = null;

function getPostgresUrl() {
  return process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
}

function resolvePostgresTenantUsageLedger(): TenantUsageLedgerResolution {
  const postgresUrl = getPostgresUrl();
  if (!postgresUrl) {
    return {
      ledger: null,
      mode: "unsupported",
      skipped: true,
      reasons: ["tenant_usage_postgres_url_missing"]
    };
  }

  if (!cachedPostgresLedger || cachedPostgresUrl !== postgresUrl) {
    cachedPostgresLedger = new DatabaseTenantUsageLedger({
      executor: createQueryExecutor({ mode: "postgres", postgresUrl }),
      persistenceMode: "postgres"
    });
    cachedPostgresUrl = postgresUrl;
  }

  return {
    ledger: cachedPostgresLedger,
    mode: "postgres",
    skipped: false,
    reasons: []
  };
}

export function resolveTenantUsageLedger(context?: RequestContext): TenantUsageLedgerResolution {
  const authMode = getAuthMode();
  const persistenceMode = context?.persistenceMode ?? authMode.persistenceMode;

  if (persistenceMode === "postgres") {
    return resolvePostgresTenantUsageLedger();
  }

  if (authMode.isProduction) {
    return {
      ledger: null,
      mode: "unsupported",
      skipped: true,
      reasons: ["tenant_usage_memory_fallback_forbidden_in_production"]
    };
  }

  return {
    ledger: tenantUsageLedger,
    mode: "memory",
    skipped: false,
    reasons: []
  };
}

export function resetTenantUsageRuntimeForTests() {
  cachedPostgresLedger = null;
  cachedPostgresUrl = null;
  tenantUsageLedger.reset();
}
