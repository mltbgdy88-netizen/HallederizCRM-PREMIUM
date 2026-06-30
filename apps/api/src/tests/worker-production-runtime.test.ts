import assert from "node:assert/strict";
import test from "node:test";
import {
  createWorkerRuntimeApp,
  getWorkerJobHandler,
  InMemoryOutboxJobRepository,
  normalizeWorkerMode,
  processClaimedJob,
  resolveWorkerRuntimeConfig
} from "@hallederiz/domain";
import { evaluateProductionReadiness } from "../shared/production-readiness-runtime";
import type { RequestContext } from "../shared/request-context";

test("foundation dry run tick works", () => {
  const app = createWorkerRuntimeApp({ persistenceMode: "foundation_memory" });
  const tickResult = app.processTick({ dryRun: true, maxJobsPerTick: 1 });
  assert.ok(tickResult);
});

test("production missing DB URL fails closed", () => {
  const resolution = resolveWorkerRuntimeConfig({
    WORKER_MODE: "production",
    PERSISTENCE_MODE: "postgres"
  } as NodeJS.ProcessEnv);
  assert.equal(resolution.ok, false);
  assert.ok(resolution.reasons.includes("postgres_url_missing_for_production_worker"));
});

test("production config with DB resolves postgres mode", () => {
  const resolution = resolveWorkerRuntimeConfig({
    WORKER_MODE: "production",
    PERSISTENCE_MODE: "postgres",
    POSTGRES_URL: "postgres://localhost:5432/hallederiz"
  } as NodeJS.ProcessEnv);
  assert.equal(resolution.ok, true);
  assert.equal(resolution.persistenceMode, "postgres");
  assert.equal(resolution.config?.workerMode, "production");
});

test("durable worker mode alias resolves to production runtime config", () => {
  assert.equal(normalizeWorkerMode("durable"), "production");
  const resolution = resolveWorkerRuntimeConfig({
    WORKER_MODE: "durable",
    PERSISTENCE_MODE: "postgres",
    POSTGRES_URL: "postgres://localhost:5432/hallederiz"
  } as NodeJS.ProcessEnv);
  assert.equal(resolution.ok, true);
  assert.equal(resolution.config?.workerMode, "production");
  assert.equal(resolution.persistenceMode, "postgres");
});

test("unsupported worker mode remains fail-closed", () => {
  const resolution = resolveWorkerRuntimeConfig({
    WORKER_MODE: "mystery_mode",
    PERSISTENCE_MODE: "postgres",
    POSTGRES_URL: "postgres://localhost:5432/hallederiz"
  } as NodeJS.ProcessEnv);
  assert.equal(resolution.ok, false);
  assert.ok(resolution.reasons.includes("worker_mode_unsupported:mystery_mode"));
});

function withEnvPatch<T>(patch: Record<string, string | undefined>, fn: () => Promise<T> | T): Promise<T> | T {
  const previous = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(patch)) {
    previous.set(key, process.env[key]);
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  try {
    return fn();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

test("production readiness accepts durable and production worker modes", async () => {
  const baseEnv = {
    NODE_ENV: "production",
    PERSISTENCE_MODE: "postgres",
    DATABASE_URL: "postgres://demo:demo@localhost:5432/demo",
    AUTH_SESSION_SECRET: "test-secret",
    APP_BASE_URL: "https://app.example.com",
    API_BASE_URL: "https://api.example.com",
    APPROVAL_EXECUTION_MODE: "controlled",
    DEMO_AUTH_ENABLED: undefined,
    NEXT_PUBLIC_ENABLE_DEMO_AUTH: undefined,
    ALLOW_DEMO_FALLBACK: undefined,
    NEXT_PUBLIC_USE_DEMO_DATA: undefined,
    OMNICHANNEL_ALLOW_MOCK_PROVIDERS: undefined
  } as const;

  for (const workerMode of ["durable", "production"] as const) {
    await withEnvPatch({ ...baseEnv, WORKER_MODE: workerMode }, async () => {
      const payload = await evaluateProductionReadiness({
        tenantId: "tenant_1",
        userId: "user_admin",
        persistenceMode: "postgres",
        isAuthenticated: true,
        permissions: ["platform.settings.read"]
      } satisfies RequestContext);
      assert.equal(payload.workerSafe, true);
      assert.ok(!payload.blockers.includes("worker_mode_not_durable"));
    });
  }
});

test("production readiness blocks foundation worker mode", async () => {
  await withEnvPatch(
    {
      NODE_ENV: "production",
      PERSISTENCE_MODE: "postgres",
      DATABASE_URL: "postgres://demo:demo@localhost:5432/demo",
      AUTH_SESSION_SECRET: "test-secret",
      APP_BASE_URL: "https://app.example.com",
      API_BASE_URL: "https://api.example.com",
      WORKER_MODE: "foundation",
      APPROVAL_EXECUTION_MODE: "controlled"
    },
    async () => {
      const payload = await evaluateProductionReadiness({
        tenantId: "tenant_1",
        userId: "user_admin",
        persistenceMode: "postgres",
        isAuthenticated: true,
        permissions: ["platform.settings.read"]
      } satisfies RequestContext);
      assert.ok(payload.blockers.includes("worker_mode_not_durable"));
      assert.equal(payload.workerSafe, false);
    }
  );
});

test("unsupported job type does not mark completed", () => {
  const repository = new InMemoryOutboxJobRepository();
  const job = repository.enqueue({
    jobId: "job_contract_1",
    tenantId: "tenant_1",
    jobType: "ai_reply_send",
    payload: { tenantId: "tenant_1" },
    status: "pending",
    attempts: 0,
    maxAttempts: 3,
    idempotencyKey: "idem_contract_1",
    availableAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const claimed = repository.claimNext();
  assert.ok(claimed);
  const handler = getWorkerJobHandler("ai_reply_send");
  assert.ok(handler);
  const handleResult = handler!.handle(claimed!);
  assert.equal(handleResult.ok, false);
  const processed = processClaimedJob(claimed!, repository, { now: new Date().toISOString() });
  assert.notEqual(processed.status, "completed");
});

test("tenantId missing job rejected", () => {
  const repository = new InMemoryOutboxJobRepository();
  const job = repository.enqueue({
    jobId: "job_missing_tenant",
    tenantId: "",
    jobType: "ai_reply_send",
    payload: {},
    status: "pending",
    attempts: 0,
    maxAttempts: 3,
    idempotencyKey: "idem_missing_tenant",
    availableAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const claimed = repository.claimNext();
  assert.ok(claimed);
  const processed = processClaimedJob(claimed!, repository, { now: new Date().toISOString() });
  assert.equal(processed.status, "dead_letter");
  assert.ok(processed.reasons?.includes("missing_tenant_context"));
});
