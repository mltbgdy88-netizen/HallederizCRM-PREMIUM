export const returnsSchemaSql = `
CREATE TABLE IF NOT EXISTS returns (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  return_no TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`;
