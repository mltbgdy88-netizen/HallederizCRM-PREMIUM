import assert from "node:assert/strict";
import test from "node:test";
import type { QueryExecutor, QueryResultRow } from "@hallederiz/database";
import { authenticateWithDatabase } from "../shared/database-auth";
import { hashPassword } from "../shared/password-hash";

class FakeExecutor implements QueryExecutor {
  constructor(private readonly rows: QueryResultRow[]) {}

  async query<T extends QueryResultRow = QueryResultRow>(): Promise<T[]> {
    return this.rows as T[];
  }

  async transaction<T>(operation: (executor: QueryExecutor) => Promise<T>): Promise<T> {
    return operation(this);
  }
}

test("authenticateWithDatabase returns success when password hash matches", async () => {
  const passwordHash = await hashPassword("local-pilot-password");
  const executor = new FakeExecutor([
    {
      tenant_id: "tenant_1",
      tenant_slug: "hallederiz",
      tenant_name: "Hallederiz Demo Tenant",
      user_id: "user_db_admin",
      email: "pilot@hallederiz.local",
      full_name: "Pilot Admin",
      role: "platform_admin",
      is_active: true,
      password_hash: passwordHash
    }
  ]);

  const result = await authenticateWithDatabase(
    {
      tenantSlug: "hallederiz",
      email: "pilot@hallederiz.local",
      password: "local-pilot-password"
    },
    executor
  );

  assert.equal(result.status, "success");
});

test("authenticateWithDatabase returns invalid credentials when password mismatch", async () => {
  const passwordHash = await hashPassword("local-pilot-password");
  const executor = new FakeExecutor([
    {
      tenant_id: "tenant_1",
      tenant_slug: "hallederiz",
      tenant_name: "Hallederiz Demo Tenant",
      user_id: "user_db_admin",
      email: "pilot@hallederiz.local",
      full_name: "Pilot Admin",
      role: "platform_admin",
      is_active: true,
      password_hash: passwordHash
    }
  ]);

  const result = await authenticateWithDatabase(
    {
      tenantSlug: "hallederiz",
      email: "pilot@hallederiz.local",
      password: "wrong-password"
    },
    executor
  );

  assert.equal(result.status, "invalid_credentials");
});

test("authenticateWithDatabase returns inactive user when user is not active", async () => {
  const passwordHash = await hashPassword("local-pilot-password");
  const executor = new FakeExecutor([
    {
      tenant_id: "tenant_1",
      tenant_slug: "hallederiz",
      tenant_name: "Hallederiz Demo Tenant",
      user_id: "user_db_inactive",
      email: "inactive@hallederiz.local",
      full_name: "Inactive User",
      role: "platform_operator",
      is_active: false,
      password_hash: passwordHash
    }
  ]);

  const result = await authenticateWithDatabase(
    {
      tenantSlug: "hallederiz",
      email: "inactive@hallederiz.local",
      password: "local-pilot-password"
    },
    executor
  );

  assert.equal(result.status, "inactive_user");
});
