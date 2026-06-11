CREATE TABLE IF NOT EXISTS idempotency_records (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  scope TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  response_json JSONB NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 200,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE (tenant_id, scope, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_idempotency_records_expires_at
  ON idempotency_records (expires_at);

CREATE INDEX IF NOT EXISTS idx_idempotency_records_tenant_scope_created_at
  ON idempotency_records (tenant_id, scope, created_at DESC);
