-- Payment receipts schema alignment for quick-operation payment flow
-- Generated: 2026-04-30

BEGIN;

ALTER TABLE payment_receipts
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'TRY';

ALTER TABLE payment_receipts
  ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE payment_receipts
  ADD COLUMN IF NOT EXISTS reference_no TEXT;

ALTER TABLE payment_receipts
  ADD COLUMN IF NOT EXISTS document_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE payment_receipts
  ADD COLUMN IF NOT EXISTS received_at TIMESTAMP NOT NULL DEFAULT NOW();

ALTER TABLE payment_receipts
  ADD COLUMN IF NOT EXISTS created_by TEXT NOT NULL DEFAULT 'user_admin';

ALTER TABLE payment_receipts
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP;

COMMIT;
