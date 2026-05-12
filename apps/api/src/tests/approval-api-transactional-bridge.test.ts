import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import {
  resetExecutionDispatcherState,
  resetPendingApprovalRequests,
  type PendingApprovalRequest
} from "@hallederiz/domain";
import {
  type ExecuteApprovalWithOutboxBridgeResult,
  type TransactionalApprovalExecutionRequest
} from "@hallederiz/database";
import { registerPlatformCoreRoutes } from "../platform-core/routes";
import { createSession } from "../shared/session-store";
import { withDemoAuth } from "./test-env";

function authHeaders(token: string, tenantId?: string) {
  return {
    "x-session-token": token,
    authorization: `Bearer ${token}`,
    ...(tenantId ? { "x-tenant-id": tenantId } : {})
  };
}

async function createPendingApproval(server: ReturnType<typeof Fastify>, token: string) {
  const response = await server.inject({
    method: "POST",
    url: "/users",
    headers: authHeaders(token),
    payload: {
      email: "approval.api@hallederiz.com",
      fullName: "Approval API"
    }
  });
  assert.equal(response.statusCode, 202);
  const payload = response.json();
  assert.ok(typeof payload.approvalRequestId === "string");
  return payload.approvalRequestId as string;
}

function bridgeFixture(
  request: TransactionalApprovalExecutionRequest,
  overrides: Partial<ExecuteApprovalWithOutboxBridgeResult> = {}
): ExecuteApprovalWithOutboxBridgeResult {
  const executionId = `exec_${request.approvalRequestId}`;
  return {
    ok: true,
    status: "executed",
    executionResult: {
      ok: true,
      status: "executed",
      actionKey: request.actionKey,
      approvalRequestId: request.approvalRequestId,
      executionId,
      reasons: ["bridge_dispatched"],
      auditRequired: true,
      timelineRequired: true,
      idempotencyKey: request.idempotencyKey,
      handlerKey: `handler.${request.actionKey}`,
      handlerMode: "dry_run",
      executionLog: {
        executionId,
        tenantId: request.tenantId,
        approvalRequestId: request.approvalRequestId,
        actionKey: request.actionKey,
        actorId: request.actorId,
        approvedBy: request.approvedBy,
        status: "executed",
        mode: "dry_run",
        idempotencyKey: request.idempotencyKey,
        auditRequired: true,
        timelineRequired: true,
        reasons: ["bridge_dispatched"],
        createdAt: "2026-05-12T12:00:00.000Z",
        completedAt: "2026-05-12T12:00:01.000Z",
        handlerKey: `handler.${request.actionKey}`,
        handlerMode: "dry_run"
      },
      auditEvent: {
        eventKey: "approval.execution.audit",
        createdAt: "2026-05-12T12:00:01.000Z",
        payload: {
          tenantId: request.tenantId,
          actionKey: request.actionKey,
          approvalRequestId: request.approvalRequestId,
          executionId,
          status: "executed",
          idempotencyKey: request.idempotencyKey,
          handlerKey: `handler.${request.actionKey}`,
          handlerMode: "dry_run",
          reasons: ["bridge_dispatched"]
        }
      },
      timelineEvent: {
        eventKey: "approval.execution.timeline",
        createdAt: "2026-05-12T12:00:01.000Z",
        payload: {
          tenantId: request.tenantId,
          actionKey: request.actionKey,
          approvalRequestId: request.approvalRequestId,
          executionId,
          status: "executed",
          idempotencyKey: request.idempotencyKey,
          handlerKey: `handler.${request.actionKey}`,
          handlerMode: "dry_run",
          reasons: ["bridge_dispatched"]
        }
      },
      persistenceMode: "repository",
      persistenceSkipped: false
    },
    executionLogPersisted: true,
    auditEventPersisted: true,
    timelineEventPersisted: true,
    outboxJobEnqueued: true,
    outboxDuplicate: false,
    outboxJob: {
      jobId: `job_${request.approvalRequestId}`,
      tenantId: request.tenantId,
      jobType: "approval.execution.dispatch",
      actionKey: request.actionKey,
      payload: {
        tenantId: request.tenantId,
        actionKey: request.actionKey,
        approvalRequestId: request.approvalRequestId,
        executionId
      },
      status: "pending",
      attempts: 0,
      maxAttempts: 3,
      idempotencyKey: `approval_outbox:${request.idempotencyKey}`,
      availableAt: "2026-05-12T12:00:01.000Z",
      createdAt: "2026-05-12T12:00:01.000Z",
      updatedAt: "2026-05-12T12:00:01.000Z"
    },
    transactionMode: "transaction",
    persistenceMode: "repository",
    reasons: ["bridge_completed"],
    ...overrides
  };
}

test("GET /platform/approvals fails without auth", async () => {
  await withDemoAuth(async () => {
    resetPendingApprovalRequests();
    resetExecutionDispatcherState();
    const server = Fastify();
    await registerPlatformCoreRoutes(server);

    const response = await server.inject({
      method: "GET",
      url: "/platform/approvals"
    });
    assert.equal(response.statusCode, 401);
    await server.close();
  });
});

test("tenant mismatch is fail-closed for approval list", async () => {
  await withDemoAuth(async () => {
    resetPendingApprovalRequests();
    resetExecutionDispatcherState();
    const server = Fastify();
    await registerPlatformCoreRoutes(server);
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });

    const response = await server.inject({
      method: "GET",
      url: "/platform/approvals",
      headers: authHeaders(login.accessToken, "tenant_other")
    });
    assert.equal(response.statusCode, 403);
    await server.close();
  });
});

test("GET list/detail returns pending approvals", async () => {
  await withDemoAuth(async () => {
    resetPendingApprovalRequests();
    resetExecutionDispatcherState();
    const server = Fastify();
    await registerPlatformCoreRoutes(server);
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });

    const approvalRequestId = await createPendingApproval(server, login.accessToken);
    const list = await server.inject({
      method: "GET",
      url: "/platform/approvals",
      headers: authHeaders(login.accessToken)
    });
    assert.equal(list.statusCode, 200);
    assert.ok(typeof list.json().repositoryMode === "string");
    assert.ok(list.json().items.some((item: PendingApprovalRequest) => item.approvalRequestId === approvalRequestId));

    const detail = await server.inject({
      method: "GET",
      url: `/platform/approvals/${approvalRequestId}`,
      headers: authHeaders(login.accessToken)
    });
    assert.equal(detail.statusCode, 200);
    assert.equal(detail.json().item.approvalRequestId, approvalRequestId);
    await server.close();
  });
});

test("POST approve fails without approval permission", async () => {
  await withDemoAuth(async () => {
    resetPendingApprovalRequests();
    resetExecutionDispatcherState();
    const server = Fastify();
    await registerPlatformCoreRoutes(server);
    const admin = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });
    const operator = createSession({
      tenantSlug: "hallederiz",
      email: "operator@hallederiz.com",
      password: "demo"
    });

    const approvalRequestId = await createPendingApproval(server, admin.accessToken);
    const response = await server.inject({
      method: "POST",
      url: `/platform/approvals/${approvalRequestId}/approve`,
      headers: authHeaders(operator.accessToken)
    });
    assert.equal(response.statusCode, 403);
    await server.close();
  });
});

test("POST approve triggers transactional bridge and returns metadata", async () => {
  await withDemoAuth(async () => {
    resetPendingApprovalRequests();
    resetExecutionDispatcherState();
    let bridgeCalls = 0;
    const seenRequests: TransactionalApprovalExecutionRequest[] = [];
    const server = Fastify();
    await registerPlatformCoreRoutes(server, {
      approvalRoutes: {
        bridgeTrigger: async (_context, request) => {
          bridgeCalls += 1;
          seenRequests.push(request);
          return bridgeFixture(request);
        }
      }
    });

    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });
    const approvalRequestId = await createPendingApproval(server, login.accessToken);

    const response = await server.inject({
      method: "POST",
      url: `/platform/approvals/${approvalRequestId}/approve`,
      headers: authHeaders(login.accessToken)
    });

    assert.equal(response.statusCode, 200);
    const payload = response.json();
    assert.equal(bridgeCalls, 1);
    assert.equal(seenRequests[0]?.approvalRequestId, approvalRequestId);
    assert.equal(payload.ok, true);
    assert.equal(payload.status, "approved");
    assert.ok(typeof payload.executionId === "string");
    assert.ok(typeof payload.outboxJobId === "string");
    assert.ok(typeof payload.approvalPersistenceMode === "string");
    assert.equal(payload.auditMetadata.eventKey, "approval.execution.audit");
    assert.equal(payload.timelineMetadata.eventKey, "approval.execution.timeline");
    await server.close();
  });
});

test("duplicate approve is safe and does not produce new execution", async () => {
  await withDemoAuth(async () => {
    resetPendingApprovalRequests();
    resetExecutionDispatcherState();
    const seen: string[] = [];
    const server = Fastify();
    await registerPlatformCoreRoutes(server, {
      approvalRoutes: {
        bridgeTrigger: async (_context, request) => {
          const executionId = `exec_once_${request.approvalRequestId}`;
          seen.push(executionId);
          return bridgeFixture(request, {
            executionResult: {
              ...bridgeFixture(request).executionResult!,
              executionId
            },
            outboxJob: {
              ...bridgeFixture(request).outboxJob!,
              jobId: `job_once_${request.approvalRequestId}`
            }
          });
        }
      }
    });
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });
    const approvalRequestId = await createPendingApproval(server, login.accessToken);

    const first = await server.inject({
      method: "POST",
      url: `/platform/approvals/${approvalRequestId}/approve`,
      headers: authHeaders(login.accessToken)
    });
    const second = await server.inject({
      method: "POST",
      url: `/platform/approvals/${approvalRequestId}/approve`,
      headers: authHeaders(login.accessToken)
    });

    assert.equal(first.statusCode, 200);
    assert.equal(second.statusCode, 200);
    assert.equal(second.json().duplicate, true);
    assert.equal(second.json().executionId, first.json().executionId);
    assert.equal(second.json().outboxJobId, first.json().outboxJobId);
    assert.equal(seen.length, 1);
    await server.close();
  });
});

test("POST reject marks request rejected and blocks approve", async () => {
  await withDemoAuth(async () => {
    resetPendingApprovalRequests();
    resetExecutionDispatcherState();
    const server = Fastify();
    await registerPlatformCoreRoutes(server);
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });
    const approvalRequestId = await createPendingApproval(server, login.accessToken);

    const reject = await server.inject({
      method: "POST",
      url: `/platform/approvals/${approvalRequestId}/reject`,
      headers: authHeaders(login.accessToken),
      payload: { reason: "manual_review_failed" }
    });
    assert.equal(reject.statusCode, 200);
    assert.equal(reject.json().status, "rejected");
    assert.ok(typeof reject.json().approvalPersistenceMode === "string");
    assert.equal(reject.json().reason, "manual_review_failed");

    const approveAfterReject = await server.inject({
      method: "POST",
      url: `/platform/approvals/${approvalRequestId}/approve`,
      headers: authHeaders(login.accessToken)
    });
    assert.equal(approveAfterReject.statusCode, 409);
    await server.close();
  });
});

test("approved request cannot be rejected", async () => {
  await withDemoAuth(async () => {
    resetPendingApprovalRequests();
    resetExecutionDispatcherState();
    const server = Fastify();
    await registerPlatformCoreRoutes(server, {
      approvalRoutes: {
        bridgeTrigger: async (_context, request) => bridgeFixture(request)
      }
    });
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });
    const approvalRequestId = await createPendingApproval(server, login.accessToken);

    const approve = await server.inject({
      method: "POST",
      url: `/platform/approvals/${approvalRequestId}/approve`,
      headers: authHeaders(login.accessToken)
    });
    assert.equal(approve.statusCode, 200);

    const rejectAfterApprove = await server.inject({
      method: "POST",
      url: `/platform/approvals/${approvalRequestId}/reject`,
      headers: authHeaders(login.accessToken),
      payload: { reason: "too_late" }
    });
    assert.equal(rejectAfterApprove.statusCode, 409);
    await server.close();
  });
});

test("missing repository does not fail-open", async () => {
  await withDemoAuth(async () => {
    resetPendingApprovalRequests();
    resetExecutionDispatcherState();
    const server = Fastify();
    await registerPlatformCoreRoutes(server, {
      approvalRoutes: {
        pendingRepository: null
      }
    });
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });

    const response = await server.inject({
      method: "GET",
      url: "/platform/approvals",
      headers: authHeaders(login.accessToken)
    });
    assert.equal(response.statusCode, 503);
    await server.close();
  });
});
