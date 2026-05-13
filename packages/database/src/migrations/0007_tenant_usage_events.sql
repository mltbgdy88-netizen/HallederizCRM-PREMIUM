CREATE TABLE IF NOT EXISTS tenant_usage_events (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  source TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenant_usage_events_tenant_occurred_at
  ON tenant_usage_events (tenant_id, occurred_at);

CREATE INDEX IF NOT EXISTS idx_tenant_usage_events_tenant_event_type_occurred_at
  ON tenant_usage_events (tenant_id, event_type, occurred_at);

CREATE INDEX IF NOT EXISTS idx_tenant_usage_events_tenant_source_occurred_at
  ON tenant_usage_events (tenant_id, source, occurred_at);
