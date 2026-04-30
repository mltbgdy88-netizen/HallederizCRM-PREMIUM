BEGIN;

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS slug TEXT;

UPDATE tenants
SET slug = CASE
  WHEN id = 'tenant_1' THEN 'hallederiz'
  ELSE id
END
WHERE slug IS NULL OR btrim(slug) = '';

ALTER TABLE tenants
  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS tenants_slug_unique_idx
  ON tenants (LOWER(slug));

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'platform_operator',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS users_tenant_email_unique_idx
  ON users (tenant_id, LOWER(email));

COMMIT;
