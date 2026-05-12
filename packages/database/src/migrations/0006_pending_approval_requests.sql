BEGIN;

CREATE TABLE IF NOT EXISTS pending_approval_requests (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  approval_request_id TEXT NOT NULL,
  action_key TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  status TEXT NOT NULL,
  reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key TEXT,
  requested_by TEXT,
  approved_by TEXT,
  rejected_by TEXT,
  reject_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  expires_at TIMESTAMP,
  UNIQUE (tenant_id, approval_request_id),
  UNIQUE (tenant_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_pending_approval_requests_tenant_id
  ON pending_approval_requests (tenant_id);
CREATE INDEX IF NOT EXISTS idx_pending_approval_requests_status
  ON pending_approval_requests (status);
CREATE INDEX IF NOT EXISTS idx_pending_approval_requests_action_key
  ON pending_approval_requests (action_key);
CREATE INDEX IF NOT EXISTS idx_pending_approval_requests_actor_id
  ON pending_approval_requests (actor_id);
CREATE INDEX IF NOT EXISTS idx_pending_approval_requests_created_at
  ON pending_approval_requests (created_at);

COMMIT;
