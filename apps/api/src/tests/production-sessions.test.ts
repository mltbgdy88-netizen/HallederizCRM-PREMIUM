import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import type { SessionModel, LoginResponse } from "@hallederiz/types";
import { registerAuthRoutes } from "../platform-core/routes/auth-routes";
import { buildRequestContext } from "../shared/request-context";
import { assertAuthenticated } from "../shared/auth-guards";
import type { DurableSessionRepository } from "../shared/production-sessions";

// Shared durable adapter models independent API processes; Redis wire coverage
// is run separately against a real Redis service in CI.
test("production sessions survive API replacement, enforce tenant and revoke everywhere", async () => {
  const previous = { ...process.env };
  Object.assign(process.env, { NODE_ENV: "production", PERSISTENCE_MODE: "postgres", AUTH_SESSION_SECRET: "session-regression-test-secret-32-characters", DEMO_AUTH_ENABLED: "false" });
  const rows = new Map<string, SessionModel>();
  let unavailable = false;
  const check = () => { if (unavailable) throw new Error("offline"); };
  const repository: DurableSessionRepository = {
    async save(token: string, payload: LoginResponse) { check(); rows.set(token, payload.session); },
    async get(token: string) { check(); return rows.get(token) ?? null; },
    async revoke(token: string) { check(); rows.delete(token); },
    async close() {}, async ping() { check(); }
  };
  async function app() {
    const server = Fastify();
    await registerAuthRoutes(server, { sessionRepository: repository, authenticateDatabaseLogin: async () => ({ status: "success", tenantId: "tenant-real", tenantSlug: "real", tenantName: "Real", userId: "user-real", email: "user@example.test", fullName: "Test User", role: "admin" }) });
    server.get("/guarded", async (request, reply) => {
      const context = buildRequestContext(request);
      try { assertAuthenticated(context); return { tenantId: context.tenantId }; }
      catch { return reply.status(403).send({ denied: true }); }
    });
    server.get("/ready", async () => ({ status: "ready" }));
    return server;
  }
  const first = await app(); const second = await app();
  const login = () => first.inject({ method: "POST", url: "/auth/login", payload: { tenantSlug: "real", email: "user@example.test", password: "test" } });
  try {
    const response = await login();
    assert.equal(response.statusCode, 200);
    const token = response.json().accessToken;
    const headers = { authorization: `Bearer ${token}` };
    assert.equal(rows.size, 1);
    assert.equal((await second.inject({ url: "/auth/session", headers })).statusCode, 200);
    assert.equal((await second.inject({ url: "/guarded", headers })).json().tenantId, "tenant-real");
    assert.equal((await second.inject({ url: "/guarded", headers: { ...headers, "x-tenant-id": "other" } })).statusCode, 403);
    assert.equal((await second.inject({ url: "/auth/session", headers: { authorization: `Bearer ${token}.extra` } })).statusCode, 401);
    unavailable = true;
    assert.equal((await login()).statusCode, 503);
    assert.equal((await second.inject({ url: "/auth/session", headers })).statusCode, 503);
    assert.equal((await second.inject({ url: "/ready" })).statusCode, 503);
    unavailable = false;
    assert.equal((await second.inject({ method: "POST", url: "/auth/logout", headers })).statusCode, 200);
    assert.equal((await first.inject({ url: "/auth/session", headers })).statusCode, 401);
    assert.equal((await second.inject({ url: "/auth/session", headers: { cookie: "hz_session=%ZZ" } })).statusCode, 401);
  } finally {
    await first.close(); await second.close();
    for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key];
    Object.assign(process.env, previous);
  }
});
