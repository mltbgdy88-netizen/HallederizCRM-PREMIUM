import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import Fastify from "fastify";
import {
  DatabaseIdempotencyRecordRepository,
  normalizeIdempotencyPurgeLimit,
  type QueryExecutor
} from "@hallederiz/database";
import { registerCommercialOperationsRoutes } from "../commercial-operations/routes";
import { registerPlatformCoreRoutes } from "../platform-core/routes";
import { registerQuickOperationsRoutes } from "../quick-operations/routes";
import { runIdempotencyCleanup } from "../shared/idempotency-cleanup";
import {
  clearIdempotencyStoreForTests,
  purgeMemoryIdempotencyStore,
  setMemoryIdempotencyCreatedAtForTests,
  storeIdempotencyResult
} from "../shared/idempotency-store";
import { validatePaymentAmount } from "../shared/payment-validation";
import { createSession } from "../shared/session-store";
import { withDemoAuth, withEnv } from "./test-env";

const require = createRequire(import.meta.url);
const { parseArgs } = require("../../../../scripts/ops/idempotency-cleanup.cjs");

async function buildServer() {
  const server = Fastify();
  await registerPlatformCoreRoutes(server);
  await registerCommercialOperationsRoutes(server);
  await registerQuickOperationsRoutes(server);
  return server;
}

function authHeaders(token: string, idempotencyKey?: string) {
  return {
    "x-session-token": token,
    authorization: `Bearer ${token}`,
    ...(idempotencyKey ? { "idempotency-key": idempotencyKey } : {})
  };
}

class FakeIdempotencyExecutor implements QueryExecutor {
  private readonly rows = new Map<string, { id: string; expires_at: string }>();
  private seq = 0;

  constructor(seed: Array<{ id: string; expires_at: string }> = []) {
    for (const row of seed) {
      this.rows.set(row.id, row);
    }
  }

  async query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    if (sql.includes("COUNT(*)")) {
      const before = String(params[0]);
      const count = [...this.rows.values()].filter((row) => row.expires_at <= before).length;
      return [{ count: String(count) }] as T[];
    }

    if (sql.includes("DELETE FROM idempotency_records")) {
      const before = String(params[0]);
      const limit = Number(params[1]);
      const expired = [...this.rows.entries()]
        .filter(([, row]) => row.expires_at <= before)
        .sort((a, b) => a[1].expires_at.localeCompare(b[1].expires_at))
        .slice(0, limit);
      for (const [id] of expired) {
        this.rows.delete(id);
      }
      return expired.map(([id]) => ({ id })) as T[];
    }

    return [] as T[];
  }

  async transaction<T>(operation: (executor: QueryExecutor) => Promise<T>): Promise<T> {
    return operation(this);
  }

  seedExpired(count: number, beforeIso: string) {
    for (let i = 0; i < count; i += 1) {
      const id = `expired_${++this.seq}`;
      this.rows.set(id, { id, expires_at: beforeIso });
    }
  }

  seedActive(count: number, afterIso: string) {
    for (let i = 0; i < count; i += 1) {
      const id = `active_${++this.seq}`;
      this.rows.set(id, { id, expires_at: afterIso });
    }
  }
}

test("normalizeIdempotencyPurgeLimit validates bounds", () => {
  assert.equal(normalizeIdempotencyPurgeLimit(), 1000);
  assert.equal(normalizeIdempotencyPurgeLimit(250), 250);
  assert.throws(() => normalizeIdempotencyPurgeLimit(0), /idempotency_purge_limit_invalid/);
});

test("repository purge dry-run does not delete expired rows", async () => {
  const before = new Date("2026-01-01T00:00:00.000Z");
  const executor = new FakeIdempotencyExecutor();
  executor.seedExpired(3, "2025-12-31T00:00:00.000Z");
  executor.seedActive(2, "2026-06-01T00:00:00.000Z");
  const repository = new DatabaseIdempotencyRecordRepository(executor);

  const result = await repository.purgeExpiredIdempotencyRecords({ before, limit: 10, dryRun: true });
  assert.equal(result.dryRun, true);
  assert.equal(result.expiredCount, 3);
  assert.equal(result.deletedCount, 0);
});

test("repository purge delete respects limit and keeps active rows", async () => {
  const before = new Date("2026-01-01T00:00:00.000Z");
  const executor = new FakeIdempotencyExecutor();
  executor.seedExpired(5, "2025-12-31T00:00:00.000Z");
  executor.seedActive(2, "2026-06-01T00:00:00.000Z");
  const repository = new DatabaseIdempotencyRecordRepository(executor);

  const result = await repository.purgeExpiredIdempotencyRecords({ before, limit: 2, dryRun: false });
  assert.equal(result.deletedCount, 2);
  assert.equal(result.remainingEstimate, 3);
});

test("cleanup script defaults to dry-run and requires execute flag", () => {
  const dryRunArgs = parseArgs([]);
  assert.equal(dryRunArgs.dryRun, true);
  assert.equal(dryRunArgs.execute, false);

  const executeArgs = parseArgs(["--execute", "--limit=500"]);
  assert.equal(executeArgs.execute, true);
  assert.equal(executeArgs.dryRun, false);
  assert.equal(executeArgs.limit, 500);
});

test("runIdempotencyCleanup purges memory store in demo mode", async () => {
  await withEnv({ PERSISTENCE_MODE: "demo" }, async () => {
    clearIdempotencyStoreForTests();
    const context = {
      tenantId: "tenant_1",
      userId: "user_1",
      persistenceMode: "demo" as const,
      permissions: [],
      roles: []
    };

    await storeIdempotencyResult(context, "payments.create", "idem_mem_cleanup", { amount: 10 }, { statusCode: 201, body: { ok: true } }, 201);
    setMemoryIdempotencyCreatedAtForTests("tenant_1", "payments.create", "idem_mem_cleanup", Date.now() - 48 * 60 * 60 * 1000);

    const dryRun = await runIdempotencyCleanup({ dryRun: true, persistenceMode: "demo" });
    assert.equal(dryRun.mode, "memory");
    assert.equal(dryRun.deletedCount, 0);
    assert.ok(dryRun.expiredCount >= 1);

    const executed = await runIdempotencyCleanup({ dryRun: false, persistenceMode: "demo" });
    assert.ok(executed.deletedCount >= 1);
    assert.equal(purgeMemoryIdempotencyStore(), 0);
  });
});

test("payments create requires idempotency-key header", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const response = await server.inject({
      method: "POST",
      url: "/payments",
      headers: authHeaders(login.accessToken),
      payload: { customerId: "customer_1", amount: 500, method: "transfer" }
    });
    assert.equal(response.statusCode, 400);
    assert.equal(response.json().reason, "idempotency_key_required");
    await server.close();
  });
});

test("payments create replays same idempotency key", async () => {
  await withDemoAuth(async () => {
    clearIdempotencyStoreForTests();
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const headers = authHeaders(login.accessToken, "idem_payment_replay_1");
    const payload = { customerId: "customer_1", amount: 750, method: "transfer" };

    const first = await server.inject({ method: "POST", url: "/payments", headers, payload });
    const second = await server.inject({ method: "POST", url: "/payments", headers, payload });

    assert.equal(first.statusCode, second.statusCode);
    assert.deepEqual(first.json(), second.json());
    await server.close();
  });
});

test("payments create rejects idempotency key conflict", async () => {
  await withDemoAuth(async () => {
    clearIdempotencyStoreForTests();
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const headers = authHeaders(login.accessToken, "idem_payment_conflict_1");

    await server.inject({
      method: "POST",
      url: "/payments",
      headers,
      payload: { customerId: "customer_1", amount: 500, method: "transfer" }
    });
    const conflict = await server.inject({
      method: "POST",
      url: "/payments",
      headers,
      payload: { customerId: "customer_1", amount: 900, method: "transfer" }
    });

    assert.equal(conflict.statusCode, 409);
    assert.equal(conflict.json().reason, "idempotency_key_conflict");
    await server.close();
  });
});

test("payments create rejects zero and negative amount", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const response = await server.inject({
      method: "POST",
      url: "/payments",
      headers: authHeaders(login.accessToken, "idem_payment_invalid_amount"),
      payload: { customerId: "customer_1", amount: 0, method: "transfer" }
    });
    assert.equal(response.statusCode, 400);
    assert.equal(response.json().reason, "invalid_payment_amount");
    await server.close();
  });
});

test("validatePaymentAmount rejects non-positive values", () => {
  assert.equal(validatePaymentAmount(0).ok, false);
  assert.equal(validatePaymentAmount(-5).ok, false);
  assert.equal(validatePaymentAmount(10).ok, true);
});

test("payments allocate confirm requires idempotency-key", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const response = await server.inject({
      method: "POST",
      url: "/payments/payment_1/confirm",
      headers: authHeaders(login.accessToken)
    });
    assert.equal(response.statusCode, 400);
    assert.equal(response.json().reason, "idempotency_key_required");
    await server.close();
  });
});

test("quick-operations submit idempotency remains compatible", async () => {
  await withDemoAuth(async () => {
    clearIdempotencyStoreForTests();
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const payload = {
      operationType: "payment",
      customerId: "customer_1",
      customerName: "MUSTERI",
      payment: { amount: 100, method: "cash", receivedAt: new Date().toISOString() },
      lines: []
    };
    const headers = authHeaders(login.accessToken, "idem_qop_compat_1");
    const first = await server.inject({ method: "POST", url: "/quick-operations/submit", headers, payload });
    const second = await server.inject({ method: "POST", url: "/quick-operations/submit", headers, payload });
    assert.equal(first.statusCode, 200);
    assert.equal(second.statusCode, 200);
    assert.deepEqual(first.json(), second.json());
    await server.close();
  });
});
