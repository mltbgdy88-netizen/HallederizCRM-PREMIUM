-- Demo seed foundation aligned with docs/demo-data-map.md
BEGIN;

INSERT INTO tenants (id, name) VALUES ('tenant_1', 'Hallederiz Demo Tenant')
ON CONFLICT (id) DO NOTHING;

INSERT INTO customers (id, tenant_id, code, name, type, city, phone)
VALUES
  ('customer_1', 'tenant_1', 'CUS-001', 'Aydin Dekor', 'bayi', 'Istanbul', '+90 532 111 11 11'),
  ('customer_2', 'tenant_1', 'CUS-002', 'Mira Yapi', 'kurumsal', 'Ankara', '+90 532 222 22 22')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, tenant_id, code, name, brand_id, factory_id, critical_stock_level)
VALUES
  ('prod_1', 'tenant_1', 'DK-1001', 'Atlas Seri 10m', 'brand_1', 'factory_1', 20),
  ('prod_2', 'tenant_1', 'DK-2022', 'Luna Seri 16m', 'brand_2', 'factory_2', 30)
ON CONFLICT (id) DO NOTHING;

INSERT INTO sale_orders (id, tenant_id, order_no, customer_id, status, payment_status, delivery_status, grand_total)
VALUES ('order_1', 'tenant_1', 'SO-2481', 'customer_1', 'in_preparation', 'partial', 'preparing', 128500)
ON CONFLICT (id) DO NOTHING;

INSERT INTO sale_order_lines (
  id, tenant_id, order_id, product_id, product_code, product_name, quantity, unit_price, currency,
  exchange_rate, tl_unit_price, line_total, tl_line_total, price_slot_no, price_slot_label_snapshot,
  source_preference, center_stock_snapshot, factory_stock_snapshot, prepared_quantity, delivered_quantity
)
VALUES (
  'order_line_1', 'tenant_1', 'order_1', 'prod_1', 'DK-1001', 'Atlas Seri 10m', 40, 3212.5, 'TRY',
  1, 3212.5, 128500, 128500, 4, 'Bayi',
  'warehouse', 120, 200, 8, 0
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO payment_receipts (id, tenant_id, receipt_no, customer_id, amount, status, method)
VALUES ('payment_1', 'tenant_1', 'PAY-930', 'customer_1', 45000, 'confirmed', 'transfer')
ON CONFLICT (id) DO NOTHING;

INSERT INTO payment_allocations (
  id, tenant_id, payment_id, customer_id, target_type, target_id, target_no,
  target_total, open_balance, allocated_amount, currency
)
VALUES (
  'allocation_payment_1_order_1',
  'tenant_1',
  'payment_1',
  'customer_1',
  'order',
  'order_1',
  'SO-2481',
  128500,
  83500,
  45000,
  'TRY'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO warehouse_orders (
  id, tenant_id, warehouse_order_no, order_id, warehouse_id, status,
  order_no, customer_id, warehouse_name, due_at, created_at, updated_at, started_at
)
VALUES (
  'warehouse_order_1', 'tenant_1', 'WO-114', 'order_1', 'wh_1', 'picking',
  'SO-2481', 'customer_1', 'Merkez Depo', NOW(), NOW(), NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO warehouse_order_lines (
  id, tenant_id, warehouse_order_id, order_line_id, product_id, product_code, product_name,
  requested_quantity, prepared_quantity, warehouse_id, warehouse_name
)
VALUES (
  'warehouse_line_order_line_1',
  'tenant_1',
  'warehouse_order_1',
  'order_line_1',
  'prod_1',
  'DK-1001',
  'Atlas Seri 10m',
  40,
  8,
  'wh_1',
  'Merkez Depo'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO warehouse_tasks (
  id, tenant_id, warehouse_order_id, task_no, title, status, assignee_name, due_at, critical
)
VALUES (
  'task_warehouse_order_1_warehouse_line_order_line_1',
  'tenant_1',
  'warehouse_order_1',
  'WO-114-T1',
  'DK-1001 icin 40 adet hazirla',
  'open',
  'Depo Ekibi',
  NOW(),
  true
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO deliveries (id, tenant_id, delivery_no, order_id, status)
VALUES ('delivery_1', 'tenant_1', 'DLV-401', 'order_1', 'ready')
ON CONFLICT (id) DO NOTHING;

INSERT INTO invoices (id, tenant_id, invoice_no, order_id, status, grand_total)
VALUES ('invoice_1', 'tenant_1', 'INV-1201', 'order_1', 'issued', 128500)
ON CONFLICT (id) DO NOTHING;

COMMIT;
