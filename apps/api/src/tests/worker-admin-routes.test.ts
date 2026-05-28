import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import {
  InMemoryOutboxJobRepository,
  createOutboxJob,
  createWorkerRuntimeApp,
  resetWorkerJobHandlers
} from "@hallederiz/domain";
import { registerPlatformCoreRoutes } from "../platform-core/routes";
import { createSession, getSessionByToken } from "../shared/session-store";
import { withDemoAuth } from "./test-env";

function authHeaders(token: string, tenantId?: string) {
  return {
    "x-session-token": token,
    authorization: `Bearer ${token}`,
    ...(tenantId ? { "x-tenant-id": tenantId } : {})
  };
}

async function createServer(repository: InMemoryOutboxJobRepository) {
  const server = Fastify();
  await registerPlatformCoreRoutes(server, {
    workerRoutes: {
      workerRepository: {
        mode: "foundation_memory",
        repository
      },
      runtimeApp: createWorkerRuntimeApp({ repository, workerId: "worker_admin_test" })
    }
  });
  return server;
}

test("worker health endpoint fails without auth", async () => {
  await withDemoAuth(async () => {
    const server = await createServer(new InMemoryOutboxJobRepository());
    const response = await server.inject({ method: "GET", url: "/worker/health" });
    assert.equal(response.statusCode, 401);
    await server.close();
  });
});

test("worker health endpoint returns foundation metadata", async () => {
  await withDemoAuth(async () => {
    const repository = new InMemoryOutboxJobRepository();
    const server = await createServer(repository);
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });

    const response = await server.inject({
      method: "GET",
      url: "/worker/health",
      headers: authHeaders(login.accessToken)
    });

    assert.equal(response.statusCode, 200);
    const payload = response.json();
    assert.equal(payload.ok, true);
    assert.equal(payload.health.ok, true);
    assert.equal(payload.health.mode, "foundation");
    assert.equal(payload.health.workerId, "worker_admin_test");
    assert.equal(payload.productionSafety.ok, true);
    assert.equal(payload.productionSafety.providerWritesEnabled, false);
    assert.equal(typeof payload.health.summary.noJob, "boolean");
    await server.close();
  });
});

test("worker outbox list is tenant scoped", async () => {
  await withDemoAuth(async () => {
    resetWorkerJobHandlers();
    const repository = new InMemoryOutboxJobRepository();
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });
    createOutboxJob(repository, {
      tenantId: login.session.tenant.id,
      jobType: "approval.execution.dispatch",
      actionKey: "platform.users.create",
      payload: {
        tenantId: login.session.tenant.id,
        actionKey: "platform.users.create",
        approvalRequestId: "apr_a",
        executionId: "exec_a"
      },
      idempotencyKey: "idem_worker_admin_a",
      maxAttempts: 3
    });
    createOutboxJob(repository, {
      tenantId: "tenant_worker_admin_b",
      jobType: "approval.execution.dispatch",
      actionKey: "platform.users.create",
      payload: {
        tenantId: "tenant_worker_admin_b",
        actionKey: "platform.users.create",
        approvalRequestId: "apr_b",
        executionId: "exec_b"
      },
      idempotencyKey: "idem_worker_admin_b",
      maxAttempts: 3
    });

    const server = await createServer(repository);

    const response = await server.inject({
      method: "GET",
      url: "/worker/outbox",
      headers: authHeaders(login.accessToken, login.session.tenant.id)
    });

    assert.equal(response.statusCode, 200);
    const payload = response.json();
    assert.equal(payload.total >= 1, true);
    assert.equal(payload.items.every((item: { tenantId: string }) => item.tenantId === login.session.tenant.id), true);
    await server.close();
  });
});

test("worker dead-letter list is tenant scoped", async () => {
  await withDemoAuth(async () => {
    resetWorkerJobHandlers();
    const repository = new InMemoryOutboxJobRepository();
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });
    const created = createOutboxJob(repository, {
      tenantId: login.session.tenant.id,
      jobType: "approval.execution.dispatch",
      actionKey: "platform.users.create",
      payload: {
        tenantId: login.session.tenant.id,
        actionKey: "platform.users.create",
        approvalRequestId: "apr_dlq",
        executionId: "exec_dlq"
      },
      idempotencyKey: "idem_worker_admin_dlq",
      maxAttempts: 3
    });
    const dead = repository.moveToDeadLetter(created.job.jobId, "non_retryable_failure", "2026-05-12T14:00:00.000Z");
    assert.ok(dead);

    const server = await createServer(repository);

    const response = await server.inject({
      method: "GET",
      url: "/worker/dead-letter",
      headers: authHeaders(login.accessToken, login.session.tenant.id)
    });

    assert.equal(response.statusCode, 200);
    const payload = response.json();
    assert.equal(payload.items.every((item: { tenantId: string }) => item.tenantId === login.session.tenant.id), true);
    await server.close();
  });
});

test("worker dead-letter replay fails without replay permission", async () => {
  await withDemoAuth(async () => {
    const repository = new InMemoryOutboxJobRepository();
    const server = await createServer(repository);
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });
    const session = getSessionByToken(login.accessToken);
    assert.ok(session);
    session.permissions = session.permissions.filter((permission) => permission.key === "platform.settings.read");

    const response = await server.inject({
      method: "POST",
      url: "/worker/dead-letter/job_missing/replay",
      headers: authHeaders(login.accessToken, login.session.tenant.id)
    });

    assert.equal(response.statusCode, 403);
    await server.close();
  });
});

test("worker dead-letter replay queues safe pending job in foundation adapter", async () => {
  await withDemoAuth(async () => {
    resetWorkerJobHandlers();
    const repository = new InMemoryOutboxJobRepository();
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });
    const created = createOutboxJob(repository, {
      tenantId: login.session.tenant.id,
      jobType: "approval.execution.dispatch",
      actionKey: "platform.users.create",
      payload: {
        tenantId: login.session.tenant.id,
        actionKey: "platform.users.create",
        approvalRequestId: "apr_replay",
        executionId: "exec_replay"
      },
      idempotencyKey: "idem_worker_admin_replay",
      maxAttempts: 3
    });
    const dead = repository.moveToDeadLetter(created.job.jobId, "non_retryable_failure", "2026-05-12T14:10:00.000Z");
    assert.ok(dead);

    const server = await createServer(repository);

    const response = await server.inject({
      method: "POST",
      url: `/worker/dead-letter/${dead.jobId}/replay`,
      headers: authHeaders(login.accessToken, login.session.tenant.id)
    });

    assert.equal(response.statusCode, 200);
    const payload = response.json();
    assert.equal(payload.ok, true);
    assert.equal(payload.replayed.status, "pending");
    assert.equal(payload.reasons.includes("dead_letter_replayed_to_pending_foundation"), true);
    await server.close();
  });
});

test("worker repository dependency missing does not fail-open success", async () => {
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
      url: "/worker/health",
      headers: authHeaders(login.accessToken, login.session.tenant.id)
    });

    assert.equal(response.statusCode, 503);
    const payload = response.json();
    assert.equal(payload.ok, false);
    assert.equal(payload.error, "worker_repository_unavailable");
    await server.close();
  });
});
