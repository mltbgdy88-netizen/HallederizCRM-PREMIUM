export const warehouseSchemaSql = `
CREATE TABLE IF NOT EXISTS warehouse_orders (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  warehouse_order_no TEXT NOT NULL,
  order_id TEXT NOT NULL,
  warehouse_id TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`;

export const warehouseOrderLinesSchemaSql = `
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
`;

export const warehouseTasksSchemaSql = `
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
`;
