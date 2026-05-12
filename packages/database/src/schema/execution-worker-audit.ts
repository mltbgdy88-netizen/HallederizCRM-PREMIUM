export const executionWorkerAuditSchemaSql = `
CREATE TABLE IF NOT EXISTS approval_execution_logs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  approval_request_id TEXT NOT NULL,
  action_key TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  approved_by TEXT NOT NULL,
  status TEXT NOT NULL,
  mode TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  audit_required BOOLEAN NOT NULL DEFAULT TRUE,
  timeline_required BOOLEAN NOT NULL DEFAULT TRUE,
  reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  handler_key TEXT NOT NULL,
  handler_mode TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS timeline_events (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  subject_type TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  actor_id TEXT,
  action_key TEXT NOT NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  correlation_id TEXT,
  idempotency_key TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outbox_jobs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  job_type TEXT NOT NULL,
  action_key TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL,
  idempotency_key TEXT NOT NULL,
  available_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_error TEXT,
  locked_at TIMESTAMP,
  locked_by TEXT,
  UNIQUE (tenant_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS dead_letter_jobs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  original_job_id TEXT NOT NULL,
  job_type TEXT NOT NULL,
  action_key TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  attempts INTEGER NOT NULL,
  max_attempts INTEGER NOT NULL,
  idempotency_key TEXT NOT NULL,
  dead_letter_reason TEXT NOT NULL,
  last_error TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  moved_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`;
