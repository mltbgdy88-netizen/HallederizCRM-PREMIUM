-- Commercial line tables + document delivery parity (Sprint 2)

CREATE TABLE IF NOT EXISTS payment_reversals (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  reversal_no TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY',
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_by TEXT,
  approved_by TEXT,
  approval_id TEXT,
  outbox_job_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_reversals_tenant_payment
  ON payment_reversals (tenant_id, payment_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_payment_reversals_tenant_reversal_no
  ON payment_reversals (tenant_id, reversal_no)
  WHERE reversal_no IS NOT NULL;

CREATE TABLE IF NOT EXISTS delivery_lines (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  delivery_id TEXT NOT NULL,
  order_id TEXT,
  product_id TEXT,
  sku TEXT,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT,
  warehouse_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_lines_tenant_delivery
  ON delivery_lines (tenant_id, delivery_id);
CREATE INDEX IF NOT EXISTS idx_delivery_lines_tenant_order
  ON delivery_lines (tenant_id, order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_lines_tenant_product
  ON delivery_lines (tenant_id, product_id);

CREATE TABLE IF NOT EXISTS invoice_lines (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  invoice_id TEXT NOT NULL,
  source_type TEXT,
  source_id TEXT,
  product_id TEXT,
  sku TEXT,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  tax_rate NUMERIC,
  line_total NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_lines_tenant_invoice
  ON invoice_lines (tenant_id, invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_lines_tenant_source
  ON invoice_lines (tenant_id, source_type, source_id);

CREATE TABLE IF NOT EXISTS return_lines (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  return_id TEXT NOT NULL,
  order_id TEXT,
  invoice_id TEXT,
  product_id TEXT,
  sku TEXT,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  reason TEXT,
  condition TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_return_lines_tenant_return
  ON return_lines (tenant_id, return_id);
CREATE INDEX IF NOT EXISTS idx_return_lines_tenant_order
  ON return_lines (tenant_id, order_id);
CREATE INDEX IF NOT EXISTS idx_return_lines_tenant_invoice
  ON return_lines (tenant_id, invoice_id);

CREATE TABLE IF NOT EXISTS document_deliveries (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  document_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  recipient TEXT,
  provider_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  approval_id TEXT,
  outbox_job_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_deliveries_tenant_document
  ON document_deliveries (tenant_id, document_id);
CREATE INDEX IF NOT EXISTS idx_document_deliveries_tenant_channel_status
  ON document_deliveries (tenant_id, channel, status);
CREATE INDEX IF NOT EXISTS idx_document_deliveries_tenant_provider_message
  ON document_deliveries (tenant_id, provider_message_id);
