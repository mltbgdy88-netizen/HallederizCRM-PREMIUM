export const whatsappWorkflowsSchemaSql = `
CREATE TABLE IF NOT EXISTS tenant_whatsapp_workflows (
  tenant_id TEXT PRIMARY KEY,
  store_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenant_whatsapp_workflows_updated_at
  ON tenant_whatsapp_workflows(updated_at);
`;
