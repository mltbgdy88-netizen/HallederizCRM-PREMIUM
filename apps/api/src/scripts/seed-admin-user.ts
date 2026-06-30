import { randomUUID } from "node:crypto";
import { createQueryExecutor } from "@hallederiz/database";
import { hashPassword } from "../shared/password-hash";

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value || !value.trim()) {
    throw new Error(`${name} is required.`);
  }
  return value.trim();
}

async function main() {
  const postgresUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!postgresUrl) {
    throw new Error("POSTGRES_URL or DATABASE_URL is required.");
  }

  const tenantSlug = requireEnv("AUTH_SEED_TENANT_SLUG", "hallederiz");
  const tenantName = requireEnv("AUTH_SEED_TENANT_NAME", "Hallederiz Operations Tenant");
  const adminEmail = requireEnv("AUTH_SEED_ADMIN_EMAIL");
  const adminPassword = requireEnv("AUTH_SEED_ADMIN_PASSWORD");
  const adminFullName = requireEnv("AUTH_SEED_ADMIN_FULL_NAME", "Platform Admin");
  const adminRole = requireEnv("AUTH_SEED_ADMIN_ROLE", "platform_admin");

  const executor = createQueryExecutor({
    mode: "postgres",
    postgresUrl
  });

  const passwordHash = await hashPassword(adminPassword);
  const fallbackTenantId = `tenant_${tenantSlug}`;
  const userId = `user_${adminEmail.toLocaleLowerCase("tr-TR").replace(/[^a-z0-9]+/g, "_")}_${randomUUID().slice(0, 8)}`;

  await executor.transaction(async (tx) => {
    const existingTenants = await tx.query<{ id: string }>(
      `
        SELECT id
        FROM tenants
        WHERE LOWER(slug) = LOWER($1)
        LIMIT 1
      `,
      [tenantSlug]
    );
    const tenantId = existingTenants[0]?.id ?? fallbackTenantId;

    await tx.query(
      `
        INSERT INTO tenants (id, slug, name, plan_code, status)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE
        SET slug = EXCLUDED.slug,
            name = EXCLUDED.name,
            plan_code = EXCLUDED.plan_code,
            status = EXCLUDED.status
      `,
      [tenantId, tenantSlug, tenantName, "premium", "active"]
    );

    const existingUsers = await tx.query<{ id: string }>(
      `
        SELECT id
        FROM users
        WHERE tenant_id = $1
          AND LOWER(email) = LOWER($2)
        LIMIT 1
      `,
      [tenantId, adminEmail]
    );

    const existingUser = existingUsers[0];
    if (existingUser?.id) {
      await tx.query(
        `
          UPDATE users
          SET full_name = $3,
              password_hash = $4,
              role = $5,
              is_active = TRUE,
              updated_at = NOW()
          WHERE id = $1
            AND tenant_id = $2
        `,
        [existingUser.id, tenantId, adminFullName, passwordHash, adminRole]
      );
    } else {
      await tx.query(
        `
          INSERT INTO users (id, tenant_id, full_name, email, password_hash, role, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, TRUE, NOW(), NOW())
        `,
        [userId, tenantId, adminFullName, adminEmail, passwordHash, adminRole]
      );
    }
  });

  console.log(`Auth admin seeded for tenant '${tenantSlug}' and email '${adminEmail}'.`);
}

main().catch((error) => {
  console.error("seed-admin-user failed:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
