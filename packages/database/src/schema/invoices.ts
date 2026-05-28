export const invoicesSchemaSql = `
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  invoice_no TEXT NOT NULL,
  order_id TEXT,
  status TEXT NOT NULL,
  grand_total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`;
