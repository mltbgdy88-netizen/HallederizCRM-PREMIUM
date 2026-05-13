import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import {
  FoundationOutboxClaimSimulator,
  isOutboxJobClaimEligible,
  mapOutboxClaimLeaseParams
} from "@hallederiz/database";
import { InMemoryOutboxJobRepository, createOutboxJob, processWorkerTick, resetWorkerJobHandlers } from "@hallederiz/domain";
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

test("active lease blocks claim and expired lease becomes claimable", () => {
  const now = "2026-06-01T10:00:00.000Z";
  const params = mapOutboxClaimLeaseParams(now, { workerId: "worker_a", claimLeaseMs: 60_000 });

  assert.equal(
    isOutboxJobClaimEligible({
      status: "pending",
      availableAt: "2026-06-01T09:59:00.000Z",
      leaseExpiresAt: "2026-06-01T10:00:30.000Z",
      nowIso: now
    }),
    false
  );

  assert.equal(
    isOutboxJobClaimEligible({
      status: "failed",
      availableAt: "2026-06-01T09:59:00.000Z",
      leaseExpiresAt: "2026-06-01T09:59:30.000Z",
      nowIso: now
    }),
    true
  );

  const simulator = new FoundationOutboxClaimSimulator([
    {
      jobId: "job_expired",
      status: "failed",
      availableAt: "2026-06-01T09:59:00.000Z",
      leaseExpiresAt: "2026-06-01T09:59:59.000Z"
    }
  ]);
  const claimed = simulator.claimNext(now, { workerId: "worker_a", claimLeaseMs: params.claimLeaseMs });
  assert.ok(claimed);
  assert.equal(claimed?.status, "claimed");
});

test("duplicate idempotency key does not create second outbox job", () => {
  const repository = new InMemoryOutboxJobRepository();
  const first = createOutboxJob(repository, {
    tenantId: "tenant_dup",
    jobType: "approval.execution.dispatch",
    actionKey: "platform.settings.update",
    payload: {
      tenantId: "tenant_dup",
      actionKey: "platform.settings.update",
      approvalRequestId: "apr_dup_1",
      executionId: "exec_dup_1",
      idempotencyKey: "idem_dup_1",
      auditRequired: true,
      timelineRequired: true,
      auditEvent: { eventKey: "audit" },
      timelineEvent: { eventKey: "timeline" }
    },
    idempotencyKey: "idem_dup_1",
    maxAttempts: 3
  });
  const second = createOutboxJob(repository, {
    tenantId: "tenant_dup",
    jobType: "approval.execution.dispatch",
    actionKey: "platform.settings.update",
    payload: {
      tenantId: "tenant_dup",
      actionKey: "platform.settings.update",
      approvalRequestId: "apr_dup_1",
      executionId: "exec_dup_1",
      idempotencyKey: "idem_dup_1",
      auditRequired: true,
      timelineRequired: true,
      auditEvent: { eventKey: "audit" },
      timelineEvent: { eventKey: "timeline" }
    },
    idempotencyKey: "idem_dup_1",
    maxAttempts: 3
  });

  assert.equal(first.created, true);
  assert.equal(second.created, false);
  assert.equal(second.duplicate, true);
});

test("cancelled job is not executed and remains fail-closed", () => {
  resetWorkerJobHandlers();
  const repository = new InMemoryOutboxJobRepository();
  createOutboxJob(repository, {
    tenantId: "tenant_cancel",
    jobType: "approval.execution.dispatch",
    actionKey: "platform.settings.update",
    payload: {
      tenantId: "tenant_cancel",
      actionKey: "platform.settings.update",
      approvalRequestId: "apr_cancel_1",
      executionId: "exec_cancel_1",
      idempotencyKey: "idem_cancel_1",
      auditRequired: true,
      timelineRequired: true,
      auditEvent: { eventKey: "audit" },
      timelineEvent: { eventKey: "timeline" }
    },
    idempotencyKey: "idem_cancel_1",
    maxAttempts: 3
  });
  const claimed = repository.claimNext();
  assert.ok(claimed);
  if (claimed) {
    claimed.status = "cancelled";
    repository.enqueue(claimed);
  }
  const result = processWorkerTick(repository, { maxJobsPerTick: 1 });
  assert.equal(result.completed, 0);
});

test("approval approve endpoint returns durable outbox metadata", async () => {
  await withDemoAuth(async () => {
    const server = Fastify();
    await registerPlatformCoreRoutes(server);
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });

    const seeded = await server.inject({
      method: "POST",
      url: "/platform/approvals/sandbox/seed",
      headers: authHeaders(login.accessToken, login.session.tenant.id)
    });
    assert.equal(seeded.statusCode, 200);

    const list = await server.inject({
      method: "GET",
      url: "/platform/approvals",
      headers: authHeaders(login.accessToken, login.session.tenant.id)
    });
    const pending = list.json().items?.[0];
    assert.ok(pending?.approvalRequestId);

    const approved = await server.inject({
      method: "POST",
      url: `/platform/approvals/${pending.approvalRequestId}/approve`,
      headers: authHeaders(login.accessToken, login.session.tenant.id)
    });
    assert.equal(approved.statusCode, 200);
    const payload = approved.json();
    assert.equal(typeof payload.outboxJobId, "string");
    assert.equal(payload.outboxQueued || payload.outboxMode === "duplicate", true);
    await server.close();
  });
});
