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
