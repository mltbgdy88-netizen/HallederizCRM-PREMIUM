CREATE TABLE IF NOT EXISTS omnichannel_conversations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  external_conversation_id TEXT NOT NULL,
  customer_id TEXT,
  contact_handle TEXT,
  contact_display_name TEXT,
  status TEXT NOT NULL,
  assigned_user_id TEXT,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_message_at TIMESTAMP NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, channel, external_conversation_id)
);

CREATE TABLE IF NOT EXISTS omnichannel_messages (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  external_message_id TEXT,
  direction TEXT NOT NULL,
  author_type TEXT NOT NULL,
  author_id TEXT,
  text TEXT NOT NULL,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL,
  policy_decision TEXT,
  approval_request_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, channel, external_message_id)
);

CREATE INDEX IF NOT EXISTS idx_omni_conv_tenant_status_updated
  ON omnichannel_conversations (tenant_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_omni_conv_tenant_created
  ON omnichannel_conversations (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_omni_msg_tenant_conversation_created
  ON omnichannel_messages (tenant_id, conversation_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_omni_msg_tenant_channel_created
  ON omnichannel_messages (tenant_id, channel, created_at DESC);
