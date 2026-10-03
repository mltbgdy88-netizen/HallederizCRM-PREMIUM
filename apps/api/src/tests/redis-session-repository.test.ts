import assert from "node:assert/strict";
import test from "node:test";
import type { LoginResponse } from "@hallederiz/types";
import { RedisSessionRepository, type RedisSessionClient } from "../shared/redis-session-repository";

function fakeResponse(token: string): LoginResponse {
  return {
    accessToken: token,
    refreshToken: "refresh-token",
    session: {
      id: "session_1",
      tenant: { id: "tenant_1", slug: "tenant-1", name: "Tenant 1" },
      user: { id: "user_1", tenantId: "tenant_1", email: "admin@example.com", fullName: "Admin", status: "active", title: "admin", directPermissions: [] },
      roles: [],
      permissions: [],
      createdAt: new Date().toISOString(),
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60_000).toISOString()
    }
  } as unknown as LoginResponse;
}

class FakeRedis implements RedisSessionClient {
  isOpen = false;
  readonly values = new Map<string, { value: string; expiresAt: number }>();
  async connect() { this.isOpen = true; }
  async set(key: string, value: string, options: { EX: number }) {
    this.values.set(key, { value, expiresAt: Date.now() + options.EX * 1000 });
  }
  async get(key: string) {
    const item = this.values.get(key);
    if (!item || item.expiresAt <= Date.now()) { this.values.delete(key); return null; }
    return item.value;
  }
  async del(key: string) { this.values.delete(key); }
  async quit() { this.isOpen = false; }
}

test("session keys contain only a sha256 token hash and survive a shared repository", async () => {
  const redis = new FakeRedis();
  const first = new RedisSessionRepository({ url: "redis://test", client: redis, ttlSeconds: 60 });
  const second = new RedisSessionRepository({ url: "redis://test", client: redis, ttlSeconds: 60 });
  const token = "hst_sensitive-token-value";
  await first.save(token, fakeResponse(token));

  assert.equal(redis.values.size, 1);
  const key = [...redis.values.keys()][0] ?? "";
  assert.match(key, /^hallederiz:session:[a-f0-9]{64}$/);
  assert.equal(key.includes(token), false);
  assert.equal((await second.get(token))?.tenant.id, "tenant_1");
  await second.revoke(token);
  assert.equal(await first.get(token), null);
});

test("expired sessions are rejected and removed", async () => {
  const redis = new FakeRedis();
  const repository = new RedisSessionRepository({ url: "redis://test", client: redis, ttlSeconds: 0 });
  await repository.save("token", fakeResponse("token"));
  assert.equal(await repository.get("token"), null);
});
