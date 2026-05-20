import assert from "node:assert/strict";
import test from "node:test";
import {
  createWorkerRuntimeApp,
  getWorkerJobHandler,
  InMemoryOutboxJobRepository,
  processClaimedJob,
  resolveWorkerRuntimeConfig
} from "@hallederiz/domain";

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
