import {
  createDatabaseOperatorTenantDirectoryRepository,
  createDatabasePlatformAnnouncementVideoRepository,
  createQueryExecutor,
  type QueryExecutor
} from "@hallederiz/database";
import { buildPersistenceUnavailableError, getPersistencePolicy } from "./persistence-policy";

export interface OperatorPostgresRuntime {
  enabled: boolean;
  executor: QueryExecutor;
  videos: ReturnType<typeof createDatabasePlatformAnnouncementVideoRepository>;
  tenants: ReturnType<typeof createDatabaseOperatorTenantDirectoryRepository>;
}

let cachedRuntime: OperatorPostgresRuntime | null = null;
let cachedPostgresUrl: string | null = null;

function resolvePostgresUrl(): string | null {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  return url?.trim() ? url.trim() : null;
}

export function isOperatorPostgresEnabled(): boolean {
  return getPersistencePolicy().persistenceMode === "postgres" && Boolean(resolvePostgresUrl());
}

export function resolveOperatorPostgresRuntime(): OperatorPostgresRuntime | null {
  if (!isOperatorPostgresEnabled()) {
    return null;
  }

  const postgresUrl = resolvePostgresUrl();
  if (!postgresUrl) {
    return null;
  }

  if (cachedRuntime && cachedPostgresUrl === postgresUrl) {
    return cachedRuntime;
  }

  const executor = createQueryExecutor({ mode: "postgres", postgresUrl });
  cachedRuntime = {
    enabled: true,
    executor,
    videos: createDatabasePlatformAnnouncementVideoRepository({ executor, persistenceMode: "postgres" }),
    tenants: createDatabaseOperatorTenantDirectoryRepository({ executor, persistenceMode: "postgres" })
  };
  cachedPostgresUrl = postgresUrl;
  return cachedRuntime;
}

export function assertOperatorPostgresRuntime(): OperatorPostgresRuntime {
  const runtime = resolveOperatorPostgresRuntime();
  if (!runtime) {
    throw buildPersistenceUnavailableError(new Error("operator_postgres_runtime_unavailable"), {
      persistenceMode: getPersistencePolicy().persistenceMode,
      hasPostgresUrl: Boolean(resolvePostgresUrl())
    });
  }
  return runtime;
}
