export const offersSchemaSql = `
CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  offer_no TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  status TEXT NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  note TEXT,
  price_slot_no_snapshot INTEGER NOT NULL,
  price_slot_label_snapshot TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount_total NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC NOT NULL DEFAULT 20,
  tax_total NUMERIC NOT NULL DEFAULT 0,
  grand_total NUMERIC NOT NULL DEFAULT 0,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMP,
  converted_order_draft_id TEXT,
  document_status TEXT
);

CREATE TABLE IF NOT EXISTS offer_lines (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  offer_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_code TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  price_slot_no INTEGER NOT NULL,
  price_slot_label_snapshot TEXT NOT NULL,
  unit_price NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  exchange_rate NUMERIC NOT NULL DEFAULT 1,
  discount_percent NUMERIC NOT NULL DEFAULT 0,
  line_total NUMERIC NOT NULL DEFAULT 0,
  source_preference TEXT NOT NULL DEFAULT 'warehouse',
  center_stock_snapshot NUMERIC NOT NULL DEFAULT 0,
  factory_stock_snapshot NUMERIC NOT NULL DEFAULT 0,
  price_override BOOLEAN NOT NULL DEFAULT FALSE,
  pricing_warning TEXT
);

CREATE TABLE IF NOT EXISTS offer_followups (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  offer_id TEXT NOT NULL,
  contact_channel TEXT NOT NULL,
  response_state TEXT NOT NULL,
  note TEXT NOT NULL,
  planned_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`;
