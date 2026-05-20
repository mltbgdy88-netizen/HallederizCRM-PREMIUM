import type { WorkerPersistenceMode } from "./lifecycle";

function parseBooleanEnv(value: string | undefined, defaultValue = false): boolean {
  if (value === undefined || value === "") return defaultValue;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

export type WorkerMode = "foundation_dry_run" | "production" | "disabled";

export interface WorkerRuntimeEnvConfig {
  workerMode: WorkerMode;
  persistenceMode: "demo" | "postgres";
  postgresUrl?: string;
  workerId: string;
  claimLeaseMs: number;
}

export interface WorkerRuntimeConfigResolution {
  ok: boolean;
  config?: WorkerRuntimeEnvConfig;
  persistenceMode: WorkerPersistenceMode;
  reasons: string[];
}

function readEnv(source: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  return source;
}

export function resolveWorkerRuntimeConfig(env: NodeJS.ProcessEnv = process.env): WorkerRuntimeConfigResolution {
  const workerMode = (env.WORKER_MODE ?? "foundation_dry_run").trim().toLowerCase() as WorkerMode;
  const persistenceMode = (env.PERSISTENCE_MODE ?? "demo").trim().toLowerCase();
  const postgresUrl = (env.POSTGRES_URL ?? env.DATABASE_URL ?? "").trim() || undefined;
  const workerId = (env.WORKER_ID ?? "worker.production").trim() || "worker.production";
  const claimLeaseMs = Number(env.WORKER_CLAIM_LEASE_MS ?? "300000");
  const reasons: string[] = [];

  if (workerMode === "disabled") {
    return { ok: false, persistenceMode: "unsupported", reasons: ["worker_mode_disabled"] };
  }

  if (workerMode === "foundation_dry_run") {
    return {
      ok: true,
      config: {
        workerMode,
        persistenceMode: persistenceMode === "postgres" ? "postgres" : "demo",
        postgresUrl,
        workerId: env.WORKER_ID ?? "worker.foundation",
        claimLeaseMs: Number.isFinite(claimLeaseMs) ? claimLeaseMs : 300000
      },
      persistenceMode: "foundation_memory",
      reasons: ["worker_foundation_dry_run"]
    };
  }

  if (workerMode !== "production") {
    return { ok: false, persistenceMode: "unsupported", reasons: [`worker_mode_unsupported:${workerMode}`] };
  }

  if (persistenceMode !== "postgres") {
    return {
      ok: false,
      persistenceMode: "unsupported",
      reasons: ["production_worker_requires_postgres_persistence"]
    };
  }

  if (!postgresUrl) {
    return {
      ok: false,
      persistenceMode: "postgres",
      reasons: ["postgres_url_missing_for_production_worker"]
    };
  }

  if (parseBooleanEnv(env.ALLOW_DEMO_FALLBACK, false)) {
    return {
      ok: false,
      persistenceMode: "postgres",
      reasons: ["demo_fallback_forbidden_for_production_worker"]
    };
  }

  return {
    ok: true,
    config: {
      workerMode,
      persistenceMode: "postgres",
      postgresUrl,
      workerId,
      claimLeaseMs: Number.isFinite(claimLeaseMs) ? claimLeaseMs : 300000
    },
    persistenceMode: "postgres",
    reasons: ["worker_production_postgres_ready"]
  };
}
