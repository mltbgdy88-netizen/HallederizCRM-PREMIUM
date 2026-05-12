BEGIN;

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

CREATE INDEX IF NOT EXISTS idx_approval_execution_logs_tenant_id
  ON approval_execution_logs (tenant_id);
CREATE INDEX IF NOT EXISTS idx_approval_execution_logs_approval_request_id
  ON approval_execution_logs (approval_request_id);
CREATE INDEX IF NOT EXISTS idx_approval_execution_logs_action_key
  ON approval_execution_logs (action_key);
CREATE INDEX IF NOT EXISTS idx_approval_execution_logs_status
  ON approval_execution_logs (status);

ALTER TABLE audit_events
  ADD COLUMN IF NOT EXISTS actor_id TEXT,
  ADD COLUMN IF NOT EXISTS action_key TEXT,
  ADD COLUMN IF NOT EXISTS event_type TEXT,
  ADD COLUMN IF NOT EXISTS payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

ALTER TABLE audit_events
  ALTER COLUMN entity_type DROP NOT NULL;

ALTER TABLE audit_events
  ALTER COLUMN entity_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_events_tenant_id
  ON audit_events (tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_actor_id
  ON audit_events (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_entity
  ON audit_events (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_action_key
  ON audit_events (action_key);
CREATE INDEX IF NOT EXISTS idx_audit_events_correlation_id
  ON audit_events (correlation_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at
  ON audit_events (created_at);

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

CREATE INDEX IF NOT EXISTS idx_timeline_events_tenant_id
  ON timeline_events (tenant_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_subject
  ON timeline_events (subject_type, subject_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_action_key
  ON timeline_events (action_key);
CREATE INDEX IF NOT EXISTS idx_timeline_events_correlation_id
  ON timeline_events (correlation_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_created_at
  ON timeline_events (created_at);

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

CREATE INDEX IF NOT EXISTS idx_outbox_jobs_tenant_id
  ON outbox_jobs (tenant_id);
CREATE INDEX IF NOT EXISTS idx_outbox_jobs_status_available_at
  ON outbox_jobs (status, available_at);
CREATE INDEX IF NOT EXISTS idx_outbox_jobs_job_type
  ON outbox_jobs (job_type);
CREATE INDEX IF NOT EXISTS idx_outbox_jobs_locked_at
  ON outbox_jobs (locked_at);

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

CREATE INDEX IF NOT EXISTS idx_dead_letter_jobs_tenant_id
  ON dead_letter_jobs (tenant_id);
CREATE INDEX IF NOT EXISTS idx_dead_letter_jobs_original_job_id
  ON dead_letter_jobs (original_job_id);
CREATE INDEX IF NOT EXISTS idx_dead_letter_jobs_job_type
  ON dead_letter_jobs (job_type);
CREATE INDEX IF NOT EXISTS idx_dead_letter_jobs_idempotency_key
  ON dead_letter_jobs (idempotency_key);
CREATE INDEX IF NOT EXISTS idx_dead_letter_jobs_moved_at
  ON dead_letter_jobs (moved_at);

COMMIT;
