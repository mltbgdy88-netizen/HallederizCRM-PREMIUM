export const approvalsSchemaSql = `
CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  approval_no TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`;
