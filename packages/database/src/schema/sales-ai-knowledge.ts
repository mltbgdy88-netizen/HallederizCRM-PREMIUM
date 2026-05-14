export const salesAiKnowledgeSchemaSql = `
CREATE TABLE IF NOT EXISTS sales_ai_knowledge (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  product_id TEXT,
  product_name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  sales_notes TEXT,
  allowed_claims JSONB NOT NULL DEFAULT '[]'::jsonb,
  blocked_claims JSONB NOT NULL DEFAULT '[]'::jsonb,
  price_visibility TEXT NOT NULL DEFAULT 'hidden',
  stock_visibility TEXT NOT NULL DEFAULT 'hidden',
  faq_snippets JSONB NOT NULL DEFAULT '[]'::jsonb,
  selected_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_sales_ai_price_visibility CHECK (price_visibility IN ('visible', 'hidden')),
  CONSTRAINT chk_sales_ai_stock_visibility CHECK (stock_visibility IN ('visible', 'hidden'))
);
`;
