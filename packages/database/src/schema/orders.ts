export const ordersSchemaSql = `
CREATE TABLE IF NOT EXISTS sale_orders (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  order_no TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  offer_id TEXT,
  status TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  delivery_status TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'field',
  delivery_type TEXT NOT NULL DEFAULT 'warehouse',
  note TEXT,
  price_slot_no_snapshot INTEGER NOT NULL DEFAULT 1,
  price_slot_label_snapshot TEXT NOT NULL DEFAULT 'Fiyat Alani 1',
  currency TEXT NOT NULL DEFAULT 'TRY',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC NOT NULL DEFAULT 20,
  tax_total NUMERIC NOT NULL DEFAULT 0,
  grand_total NUMERIC NOT NULL DEFAULT 0,
  paid_total NUMERIC NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'manual',
  created_by TEXT NOT NULL DEFAULT 'user_admin',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMP
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
`;
