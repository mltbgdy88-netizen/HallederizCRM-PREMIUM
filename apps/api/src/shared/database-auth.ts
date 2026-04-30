import { createQueryExecutor, type QueryExecutor, type QueryResultRow } from "@hallederiz/database";
import type { LoginInput } from "@hallederiz/types";
import { verifyPassword } from "./password-hash";

type AuthUserRow = QueryResultRow & {
  tenant_id: string;
  tenant_slug: string;
  tenant_name: string;
  user_id: string;
  email: string;
  full_name: string;
  role: string | null;
  is_active: boolean;
  password_hash: string | null;
};

export type DatabaseAuthResult =
  | {
      status: "success";
      tenantId: string;
      tenantSlug: string;
      tenantName: string;
      userId: string;
      email: string;
      fullName: string;
      role: string;
    }
  | { status: "invalid_credentials" }
  | { status: "inactive_user" };

export async function authenticateWithDatabase(
  input: LoginInput,
  executor: QueryExecutor
): Promise<DatabaseAuthResult> {
  const rows = await executor.query<AuthUserRow>(
    `
      SELECT
        t.id AS tenant_id,
        t.slug AS tenant_slug,
        t.name AS tenant_name,
        u.id AS user_id,
        u.email AS email,
        u.full_name AS full_name,
        u.role AS role,
        COALESCE(u.is_active, TRUE) AS is_active,
        u.password_hash AS password_hash
      FROM users u
      INNER JOIN tenants t ON t.id = u.tenant_id
      WHERE LOWER(t.slug) = LOWER($1)
        AND LOWER(u.email) = LOWER($2)
      LIMIT 1
    `,
    [input.tenantSlug.trim(), input.email.trim()]
  );

  const row = rows[0];
  if (!row || !row.password_hash) {
    return { status: "invalid_credentials" };
  }

  const passwordOk = await verifyPassword(input.password, row.password_hash);
  if (!passwordOk) {
    return { status: "invalid_credentials" };
  }

  if (!row.is_active) {
    return { status: "inactive_user" };
  }

  return {
    status: "success",
    tenantId: row.tenant_id,
    tenantSlug: row.tenant_slug,
    tenantName: row.tenant_name,
    userId: row.user_id,
    email: row.email,
    fullName: row.full_name,
    role: row.role ?? "platform_operator"
  };
}

export function createPostgresAuthExecutor(): QueryExecutor {
  const postgresUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!postgresUrl) {
    throw new Error("POSTGRES_URL or DATABASE_URL is required for postgres auth mode.");
  }

  return createQueryExecutor({
    mode: "postgres",
    postgresUrl
  });
}
