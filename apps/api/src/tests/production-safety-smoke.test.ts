import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import {
  InMemoryApprovalExecutionLogRepository,
  InMemoryOutboxJobRepository,
  InMemoryPendingApprovalRepository,
  assertNoUnsafeRuntimeMode,
  createWorkerRuntimeApp,
  dispatchApprovedAction,
  evaluateProductionSafety,
  processWorkerTick,
  resetExecutionDispatcherState
} from "@hallederiz/domain";
import {
  createDatabaseTransactionRunner,
  createQueryExecutor,
  executeApprovalWithOutboxBridge
} from "@hallederiz/database";
import { registerPlatformCoreRoutes } from "../platform-core/routes";
import { executeApprovedPendingApproval } from "../shared/approval-execution-runtime";
import type { RequestContext } from "../shared/request-context";
import { createSession } from "../shared/session-store";
import { withDemoAuth } from "./test-env";

function authHeaders(token: string, tenantId?: string) {
  return {
    "x-session-token": token,
    authorization: `Bearer ${token}`,
    ...(tenantId ? { "x-tenant-id": tenantId } : {})
  };
}

function contextFixture(overrides: Partial<RequestContext> = {}): RequestContext {
  return {
    tenantId: "tenant_safety_smoke",
    userId: "approver_safety_smoke",
    persistenceMode: "demo",
    isAuthenticated: true,
    ...overrides
  };
}

test("production safety report exports controlled-safe defaults", () => {
  const report = evaluateProductionSafety();
  assert.equal(typeof evaluateProductionSafety, "function");
  assert.equal(typeof assertNoUnsafeRuntimeMode, "function");
  assert.equal(report.ok, true);
  assert.equal(report.realExecutionEnabled, false);
  assert.equal(report.providerWritesEnabled, false);
  assert.equal(report.workerAutoStartEnabled, false);
  assert.equal(report.checks.some((item) => item.key === "users_create_real_execution_blocked" && item.ok), true);
  assert.equal(report.checks.some((item) => item.key === "settings_update_controlled_foundation_only" && item.ok), true);
});

test("production safety catches unsafe runtime modes", () => {
  const report = evaluateProductionSafety({
    mode: "production",
    approvalRuntimeMode: "memory",
    realExecutionEnabled: true,
    providerWritesEnabled: true,
    workerAutoStartEnabled: true,
    repositoryUnsupportedFailsClosed: false
  });
  assert.equal(report.ok, false);
  assert.ok(report.blockers.includes("production_memory_pending_approval_fallback_disabled"));
  assert.ok(report.blockers.includes("real_execution_default_disabled"));
  assert.ok(report.blockers.includes("external_provider_writes_disabled"));
  assert.throws(() =>
    assertNoUnsafeRuntimeMode({
      mode: "production",
      approvalRuntimeMode: "memory",
      realExecutionEnabled: true
    })
  );
});

test("worker safety route is guarded and returns runtime metadata", async () => {
  await withDemoAuth(async () => {
    const repository = new InMemoryOutboxJobRepository();
    const server = Fastify();
    await registerPlatformCoreRoutes(server, {
      workerRoutes: {
        workerRepository: {
          mode: "foundation_memory",
          repository
        },
        runtimeApp: createWorkerRuntimeApp({ repository, workerId: "worker_safety_smoke" })
      }
    });

    const unauthenticated = await server.inject({ method: "GET", url: "/worker/safety" });
    assert.equal(unauthenticated.statusCode, 401);

    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });
    const response = await server.inject({
      method: "GET",
      url: "/worker/safety",
      headers: authHeaders(login.accessToken, login.session.tenant.id)
    });
    assert.equal(response.statusCode, 200);
    const payload = response.json();
    assert.equal(payload.ok, true);
    assert.equal(payload.realExecutionEnabled, false);
    assert.equal(payload.providerWritesEnabled, false);
    assert.equal(payload.productionSafety.ok, true);
    assert.equal(Array.isArray(payload.unsafeBlockers), true);
    await server.close();
  });
});

test("unsupported worker repository does not fail-open safety route success", async () => {
  await withDemoAuth(async () => {
    const server = Fastify();
    await registerPlatformCoreRoutes(server, {
      workerRoutes: {
        workerRepository: null
      }
    });
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });

    const response = await server.inject({
      method: "GET",
      url: "/worker/safety",
      headers: authHeaders(login.accessToken, login.session.tenant.id)
    });
    assert.equal(response.statusCode, 503);
    const payload = response.json();
    assert.equal(payload.ok, false);
    assert.equal(payload.error, "worker_repository_unavailable");
    await server.close();
  });
});

test("approval approve smoke produces outbox metadata and worker dry-run processing", async () => {
  resetExecutionDispatcherState();
  const pendingRepository = new InMemoryPendingApprovalRepository();
  const executionRepository = new InMemoryApprovalExecutionLogRepository();
  const outboxRepository = new InMemoryOutboxJobRepository();
  const pending = pendingRepository.createPendingApprovalRequest({
    tenantId: "tenant_safety_smoke",
    actorId: "requester_safety_smoke",
    actionKey: "platform.settings.update",
    reasons: ["critical_mutation_requires_approval"],
    payload: {
      tenantId: "tenant_safety_smoke",
      actionKey: "platform.settings.update"
    },
    idempotencyKey: "idem_safety_smoke",
    approvalRequestId: "apr_safety_smoke",
    requestedAt: "2026-05-13T09:00:00.000Z"
  });

  const runtimeResult = await executeApprovedPendingApproval({
    context: contextFixture(),
    approvalRequestId: pending.approvalRequestId,
    approverId: "approver_safety_smoke",
    repositoryResolution: {
      repository: pendingRepository,
      mode: "memory",
      reasons: []
    },
    bridgeTrigger: async (_context, request) =>
      executeApprovalWithOutboxBridge(request, {
        dispatchApprovedAction: dispatchApprovedAction,
        transactionRunner: createDatabaseTransactionRunner(createQueryExecutor({ mode: "demo" })),
        approvalExecutionRepository: executionRepository,
        outboxRepository,
        outboxJobConfig: {
          jobType: "approval.execution.dispatch",
          maxAttempts: 3
        }
      })
  });

  assert.equal(runtimeResult.ok, true);
  assert.equal(runtimeResult.outboxQueued, true);
  assert.ok(runtimeResult.outboxJobId);
  assert.equal(runtimeResult.gateDecision?.mutationAllowed, false);
  assert.equal(runtimeResult.workerProcessingRecommended, true);

  const workerResult = processWorkerTick(outboxRepository, {
    maxJobsPerTick: 1,
    lease: { workerId: "worker_safety_smoke" }
  });
  assert.equal(workerResult.completed, 1);
  assert.equal(workerResult.results[0]?.reasons.includes("mutation_executed:false"), true);
  assert.equal(workerResult.results[0]?.reasons.includes("provider_call_executed:false"), true);
});
