import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";
import { RedisSessionRepository } from "../shared/redis-session-repository";
import { createDatabaseSession } from "../shared/session-store";

test("real Redis persists sessions across repository replacement and revokes centrally", { skip: !process.env.REDIS_SESSION_TEST_URL }, async () => {
  const url = process.env.REDIS_SESSION_TEST_URL!;
  const prefix = `test:session:${randomUUID()}`;
  const first = new RedisSessionRepository({ url, prefix });
  const second = new RedisSessionRepository({ url, prefix });
  const payload = createDatabaseSession({ tenantSlug: "test", email: "test@example.test", password: "test" }, {
    status: "success", tenantId: "tenant-test", tenantSlug: "test", tenantName: "Test", userId: "user-test", email: "test@example.test", fullName: "Test User", role: "admin"
  });
  try {
    await Promise.all([first.ping(), first.ping()]);
    await first.save(payload.accessToken, payload);
    await first.close();
    assert.equal((await second.get(payload.accessToken))?.tenant.id, "tenant-test");
    await second.revoke(payload.accessToken);
    assert.equal(await second.get(payload.accessToken), null);
  } finally { await first.close(); await second.close(); }
});
