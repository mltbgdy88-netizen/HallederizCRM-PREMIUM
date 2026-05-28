export const pricingSchemaSql = `
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
`;
