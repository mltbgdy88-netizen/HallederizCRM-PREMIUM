export const paymentsSchemaSql = `
CREATE TABLE IF NOT EXISTS payment_receipts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  receipt_no TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL,
  method TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY',
  description TEXT,
  reference_no TEXT,
  document_count INTEGER NOT NULL DEFAULT 0,
  received_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by TEXT NOT NULL DEFAULT 'user_admin',
  confirmed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`;
