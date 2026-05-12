export const pendingApprovalRequestsSchemaSql = `
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
`;
