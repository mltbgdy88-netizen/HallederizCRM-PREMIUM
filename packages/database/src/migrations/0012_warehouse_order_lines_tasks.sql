-- Depo emri satir ve gorev tablolari + warehouse_orders tamamlayici kolonlar
-- Generated: 2026-05-14

BEGIN;

ALTER TABLE warehouse_orders ADD COLUMN IF NOT EXISTS order_no TEXT;
ALTER TABLE warehouse_orders ADD COLUMN IF NOT EXISTS customer_id TEXT;
ALTER TABLE warehouse_orders ADD COLUMN IF NOT EXISTS warehouse_name TEXT;
ALTER TABLE warehouse_orders ADD COLUMN IF NOT EXISTS assigned_to TEXT;
ALTER TABLE warehouse_orders ADD COLUMN IF NOT EXISTS due_at TIMESTAMP;
ALTER TABLE warehouse_orders ADD COLUMN IF NOT EXISTS note TEXT;
ALTER TABLE warehouse_orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;
ALTER TABLE warehouse_orders ADD COLUMN IF NOT EXISTS started_at TIMESTAMP;
ALTER TABLE warehouse_orders ADD COLUMN IF NOT EXISTS prepared_at TIMESTAMP;

CREATE TABLE IF NOT EXISTS warehouse_order_lines (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  warehouse_order_id TEXT NOT NULL,
  order_line_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_code TEXT NOT NULL,
  product_name TEXT NOT NULL,
  requested_quantity NUMERIC NOT NULL DEFAULT 0,
  prepared_quantity NUMERIC NOT NULL DEFAULT 0,
  warehouse_id TEXT,
  warehouse_name TEXT NOT NULL DEFAULT 'Merkez Depo',
  rack_no TEXT,
  location_code TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT warehouse_order_lines_order_fk FOREIGN KEY (warehouse_order_id) REFERENCES warehouse_orders (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS warehouse_order_lines_tenant_wo_idx
  ON warehouse_order_lines (tenant_id, warehouse_order_id);

CREATE TABLE IF NOT EXISTS warehouse_tasks (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  warehouse_order_id TEXT NOT NULL,
  task_no TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  assignee_name TEXT,
  due_at TIMESTAMP NOT NULL,
  critical BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT warehouse_tasks_order_fk FOREIGN KEY (warehouse_order_id) REFERENCES warehouse_orders (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS warehouse_tasks_tenant_wo_idx
  ON warehouse_tasks (tenant_id, warehouse_order_id);

COMMIT;
