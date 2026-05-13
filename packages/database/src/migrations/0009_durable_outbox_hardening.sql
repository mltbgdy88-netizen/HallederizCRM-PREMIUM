ALTER TABLE outbox_jobs
  ADD COLUMN IF NOT EXISTS approval_request_id TEXT,
  ADD COLUMN IF NOT EXISTS lease_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS dead_lettered_at TIMESTAMPTZ;

ALTER TABLE outbox_jobs
  DROP CONSTRAINT IF EXISTS outbox_jobs_status_check;

ALTER TABLE outbox_jobs
  ADD CONSTRAINT outbox_jobs_status_check
  CHECK (status IN ('pending', 'claimed', 'processing', 'completed', 'failed', 'dead_letter', 'cancelled'));

CREATE INDEX IF NOT EXISTS idx_outbox_jobs_tenant_status_available
  ON outbox_jobs (tenant_id, status, available_at);

CREATE INDEX IF NOT EXISTS idx_outbox_jobs_tenant_action_created
  ON outbox_jobs (tenant_id, action_key, created_at);

CREATE INDEX IF NOT EXISTS idx_outbox_jobs_lease_expires_at
  ON outbox_jobs (lease_expires_at);

CREATE INDEX IF NOT EXISTS idx_outbox_jobs_approval_request_id
  ON outbox_jobs (approval_request_id);
