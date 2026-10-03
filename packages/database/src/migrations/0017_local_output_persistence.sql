-- Tenant-scoped durable storage for edge output coordination.
CREATE TABLE IF NOT EXISTS local_output_rules (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS local_output_jobs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN ('print', 'file_save')),
  entity_id TEXT NOT NULL,
  status TEXT NOT NULL,
  payload JSONB NOT NULL,
  queued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  UNIQUE (tenant_id, id)
);

CREATE INDEX IF NOT EXISTS local_output_jobs_tenant_status_idx
  ON local_output_jobs (tenant_id, status, queued_at);

CREATE TABLE IF NOT EXISTS local_agent_states (
  tenant_id TEXT PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  version TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  message TEXT
);
