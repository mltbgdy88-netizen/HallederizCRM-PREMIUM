-- Line-level payment allocations (tahsilat dagitimi) for reporting and order detail joins
-- Generated: 2026-05-14

BEGIN;

CREATE TABLE IF NOT EXISTS payment_allocations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  target_no TEXT NOT NULL,
  target_total NUMERIC NOT NULL,
  open_balance NUMERIC NOT NULL,
  allocated_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT payment_allocations_payment_fk FOREIGN KEY (payment_id) REFERENCES payment_receipts (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS payment_allocations_tenant_payment_idx
  ON payment_allocations (tenant_id, payment_id);

CREATE INDEX IF NOT EXISTS payment_allocations_tenant_target_idx
  ON payment_allocations (tenant_id, target_type, target_id);

COMMIT;
