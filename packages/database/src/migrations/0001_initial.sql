-- HallederizCRM-PREMIUM initial persistence foundation
-- Generated: 2026-04-28

BEGIN;

-- Platform
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  city TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_contacts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  title TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS customer_addresses (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT,
  line TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS customer_accounts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  balance NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'TRY',
  credit_limit NUMERIC,
  overdue_amount NUMERIC NOT NULL DEFAULT 0,
  open_offer_count INTEGER NOT NULL DEFAULT 0,
  open_order_count INTEGER NOT NULL DEFAULT 0,
  last_payment_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_ledgers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  direction TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY',
  description TEXT NOT NULL,
  reference_type TEXT NOT NULL,
  reference_id TEXT,
  occurred_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_pricing_profiles (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  selected_price_slot_no INTEGER NOT NULL,
  price_slot_label_snapshot TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Products / Pricing
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  brand_id TEXT,
  factory_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  critical_stock_level NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS factories (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  integration_code TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  brand_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS product_barcode_aliases (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  value TEXT NOT NULL,
  normalized_value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product_category_values (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  slot_no INTEGER NOT NULL,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product_price_tiers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  slot_no INTEGER NOT NULL,
  currency TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS warehouses (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  is_central BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS warehouse_stocks (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  warehouse_id TEXT NOT NULL,
  on_hand NUMERIC NOT NULL DEFAULT 0,
  reserved NUMERIC NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_locations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  warehouse_id TEXT NOT NULL,
  rack_no TEXT,
  location_code TEXT
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  warehouse_id TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  movement_type TEXT NOT NULL,
  occurred_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_reservations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  warehouse_id TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_slot_configs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  slot_no INTEGER NOT NULL,
  name TEXT NOT NULL,
  currency TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS category_slot_configs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  slot_no INTEGER NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS exchange_rates (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  currency TEXT NOT NULL,
  buying_rate NUMERIC NOT NULL,
  selling_rate NUMERIC NOT NULL,
  fetched_at TIMESTAMP NOT NULL DEFAULT NOW(),
  source TEXT NOT NULL DEFAULT 'tcmb'
);

CREATE TABLE IF NOT EXISTS exchange_rate_policies (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  base_currency TEXT NOT NULL DEFAULT 'TRY',
  use_selling_rate_for_order BOOLEAN NOT NULL DEFAULT TRUE,
  additional_spread_percent NUMERIC NOT NULL DEFAULT 0,
  rounding_precision INTEGER NOT NULL DEFAULT 2,
  snapshot_on_order BOOLEAN NOT NULL DEFAULT TRUE
);

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

-- Commercial core
CREATE TABLE IF NOT EXISTS sale_orders (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  order_no TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  status TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  delivery_status TEXT NOT NULL,
  grand_total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sale_order_lines (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_code TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  exchange_rate NUMERIC NOT NULL DEFAULT 1,
  tl_unit_price NUMERIC NOT NULL DEFAULT 0,
  line_total NUMERIC NOT NULL DEFAULT 0,
  tl_line_total NUMERIC NOT NULL DEFAULT 0,
  price_slot_no INTEGER NOT NULL,
  price_slot_label_snapshot TEXT NOT NULL,
  source_preference TEXT NOT NULL DEFAULT 'warehouse',
  center_stock_snapshot NUMERIC NOT NULL DEFAULT 0,
  factory_stock_snapshot NUMERIC NOT NULL DEFAULT 0,
  prepared_quantity NUMERIC NOT NULL DEFAULT 0,
  delivered_quantity NUMERIC NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS order_source_plans (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  line_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  source_preference TEXT NOT NULL,
  warehouse_quantity NUMERIC NOT NULL DEFAULT 0,
  factory_quantity NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'not_planned',
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_receipts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  receipt_no TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL,
  method TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS warehouse_orders (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  warehouse_order_no TEXT NOT NULL,
  order_id TEXT NOT NULL,
  warehouse_id TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deliveries (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  delivery_no TEXT NOT NULL,
  order_id TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  invoice_no TEXT NOT NULL,
  order_id TEXT,
  status TEXT NOT NULL,
  grand_total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS returns (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  return_no TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Operations
CREATE TABLE IF NOT EXISTS workflow_instances (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  document_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMIT;
