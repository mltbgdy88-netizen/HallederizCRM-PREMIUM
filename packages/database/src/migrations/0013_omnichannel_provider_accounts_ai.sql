CREATE TABLE IF NOT EXISTS social_media_accounts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  external_account_id TEXT NOT NULL,
  display_name TEXT,
  handle TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  token_ref TEXT,
  scopes JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, provider, external_account_id)
);

CREATE INDEX IF NOT EXISTS idx_social_media_accounts_tenant_provider_status
  ON social_media_accounts (tenant_id, provider, status);

CREATE TABLE IF NOT EXISTS channel_credentials (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  encrypted_access_token TEXT,
  encrypted_refresh_token TEXT,
  expires_at TIMESTAMP,
  app_id TEXT,
  app_secret_ref TEXT,
  verify_token_hash TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_channel_credentials_tenant_provider_account
  ON channel_credentials (tenant_id, provider, account_id);

CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  account_id TEXT,
  external_event_id TEXT,
  event_type TEXT NOT NULL,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  signature_valid BOOLEAN NOT NULL DEFAULT false,
  processing_status TEXT NOT NULL DEFAULT 'received',
  idempotency_key TEXT NOT NULL,
  received_at TIMESTAMP NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP,
  error_message TEXT,
  UNIQUE (tenant_id, provider, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_tenant_provider_received
  ON webhook_events (tenant_id, provider, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_events_tenant_processing_status
  ON webhook_events (tenant_id, processing_status);

CREATE TABLE IF NOT EXISTS provider_message_receipts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  account_id TEXT,
  external_message_id TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  message_id TEXT,
  status TEXT NOT NULL,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  received_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, provider, external_message_id, status)
);

CREATE INDEX IF NOT EXISTS idx_provider_message_receipts_tenant_conversation
  ON provider_message_receipts (tenant_id, conversation_id, received_at DESC);

CREATE TABLE IF NOT EXISTS social_contacts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  external_user_id TEXT NOT NULL,
  display_name TEXT,
  username TEXT,
  profile_url TEXT,
  linked_customer_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, provider, external_user_id)
);

CREATE INDEX IF NOT EXISTS idx_social_contacts_tenant_customer
  ON social_contacts (tenant_id, linked_customer_id);

CREATE TABLE IF NOT EXISTS ai_chat_sessions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  customer_id TEXT,
  channel TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  last_intent TEXT,
  ai_model TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, conversation_id)
);

CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_tenant_status_updated
  ON ai_chat_sessions (tenant_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS ai_reply_suggestions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  source_message_id TEXT,
  draft_text TEXT NOT NULL,
  confidence NUMERIC,
  intent TEXT,
  policy_decision TEXT NOT NULL DEFAULT 'require_approval',
  approval_request_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_reply_suggestions_tenant_conversation_created
  ON ai_reply_suggestions (tenant_id, conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_reply_suggestions_tenant_approval
  ON ai_reply_suggestions (tenant_id, approval_request_id);

CREATE INDEX IF NOT EXISTS idx_ai_reply_suggestions_tenant_status
  ON ai_reply_suggestions (tenant_id, status);

CREATE TABLE IF NOT EXISTS ai_reply_jobs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  message_id TEXT,
  suggestion_id TEXT,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  next_run_at TIMESTAMP,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_reply_jobs_tenant_status_next_run
  ON ai_reply_jobs (tenant_id, status, next_run_at);

CREATE INDEX IF NOT EXISTS idx_ai_reply_jobs_tenant_conversation
  ON ai_reply_jobs (tenant_id, conversation_id);

CREATE TABLE IF NOT EXISTS channel_templates (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  template_code TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'tr',
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  external_template_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, provider, template_code, language)
);
