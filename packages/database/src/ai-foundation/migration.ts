export const aiFoundationMigrationName = "20260502_ai_foundation" as const;

export const aiFoundationMigrationSql = `
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  actor_user_id text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  correlation_id text,
  request_id text,
  source text NOT NULL DEFAULT 'system',
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  summary text NOT NULL,
  payload_redacted jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_tenant_created_at ON audit_events (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_entity ON audit_events (tenant_id, entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_correlation ON audit_events (tenant_id, correlation_id) WHERE correlation_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  event_type text NOT NULL,
  aggregate_type text NOT NULL,
  aggregate_id text NOT NULL,
  idempotency_key text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'dead_lettered', 'cancelled')),
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  max_attempts integer NOT NULL DEFAULT 5 CHECK (max_attempts > 0),
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  locked_at timestamptz,
  locked_by text,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_outbox_events_pending ON outbox_events (status, next_attempt_at, created_at);
CREATE INDEX IF NOT EXISTS idx_outbox_events_aggregate ON outbox_events (tenant_id, aggregate_type, aggregate_id);

CREATE TABLE IF NOT EXISTS inbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  provider text NOT NULL,
  provider_event_id text NOT NULL,
  content_hash text,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processing', 'processed', 'duplicate', 'rejected', 'failed')),
  rejection_reason text,
  payload_redacted jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, provider, provider_event_id)
);

CREATE INDEX IF NOT EXISTS idx_inbox_events_tenant_received_at ON inbox_events (tenant_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_inbox_events_content_hash ON inbox_events (tenant_id, provider, content_hash) WHERE content_hash IS NOT NULL;

CREATE TABLE IF NOT EXISTS idempotency_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  scope text NOT NULL,
  key text NOT NULL,
  status text NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'completed', 'failed', 'expired')),
  result_ref_type text,
  result_ref_id text,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, scope, key)
);

CREATE INDEX IF NOT EXISTS idx_idempotency_keys_expiry ON idempotency_keys (expires_at);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_result ON idempotency_keys (tenant_id, result_ref_type, result_ref_id) WHERE result_ref_type IS NOT NULL;

CREATE TABLE IF NOT EXISTS ai_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  proposal_no text NOT NULL,
  session_id text,
  source text NOT NULL DEFAULT 'crm_ui' CHECK (source IN ('crm_ui', 'whatsapp', 'voice', 'system')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'waiting_approval', 'approved', 'rejected', 'executed', 'failed', 'cancelled')),
  schema_version text NOT NULL,
  language text NOT NULL DEFAULT 'tr-TR',
  reply text NOT NULL,
  confidence numeric(4,3) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  risk_level text NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  requires_approval boolean NOT NULL DEFAULT false,
  needs_clarification boolean NOT NULL DEFAULT false,
  clarification_question text,
  requested_by text,
  approval_ticket_id uuid,
  validated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, proposal_no)
);

CREATE INDEX IF NOT EXISTS idx_ai_proposals_tenant_created_at ON ai_proposals (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_proposals_status ON ai_proposals (tenant_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS ai_proposal_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  proposal_id uuid NOT NULL REFERENCES ai_proposals(id) ON DELETE CASCADE,
  operation_type text NOT NULL,
  risk_class text NOT NULL CHECK (risk_class IN ('L0_READ_ONLY', 'L1_DRAFT', 'L2_BUSINESS_MUTATION', 'L3_EXTERNAL_SIDE_EFFECT')),
  idempotency_key text NOT NULL,
  summary text NOT NULL,
  requires_approval boolean NOT NULL DEFAULT false,
  confidence numeric(4,3) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  target jsonb,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_ai_proposal_operations_proposal ON ai_proposal_operations (proposal_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_ai_proposal_operations_type ON ai_proposal_operations (tenant_id, operation_type, created_at DESC);

CREATE TABLE IF NOT EXISTS ai_proposal_validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  proposal_id uuid REFERENCES ai_proposals(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('valid', 'invalid', 'rejected')),
  validator text NOT NULL,
  issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_proposal_validations_proposal ON ai_proposal_validations (proposal_id, created_at DESC);

CREATE TABLE IF NOT EXISTS ai_prompt_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  proposal_id uuid REFERENCES ai_proposals(id) ON DELETE SET NULL,
  prompt_hash text NOT NULL,
  snapshot_hash text NOT NULL,
  model_provider text NOT NULL DEFAULT 'local-ai-service',
  model_name text,
  pii_minimized boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_prompt_audit_proposal ON ai_prompt_audit (proposal_id, created_at DESC);

CREATE TABLE IF NOT EXISTS approval_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  operation_type text NOT NULL,
  required_role text NOT NULL,
  min_approver_count integer NOT NULL DEFAULT 1 CHECK (min_approver_count > 0),
  risk_level text NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, operation_type, required_role)
);

CREATE TABLE IF NOT EXISTS approval_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  ticket_no text NOT NULL,
  policy_id uuid REFERENCES approval_policies(id),
  source_type text NOT NULL CHECK (source_type IN ('ai_proposal', 'whatsapp_action', 'manual_operation', 'system')),
  source_id text NOT NULL,
  operation_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'executing', 'executed', 'failed', 'cancelled')),
  required_role text NOT NULL,
  requested_by text,
  decided_by text,
  decided_at timestamptz,
  expires_at timestamptz,
  risk_level text NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  payload_summary text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, ticket_no)
);

CREATE INDEX IF NOT EXISTS idx_approval_tickets_status ON approval_tickets (tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approval_tickets_source ON approval_tickets (tenant_id, source_type, source_id);

CREATE TABLE IF NOT EXISTS approval_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  ticket_id uuid NOT NULL REFERENCES approval_tickets(id) ON DELETE CASCADE,
  actor_user_id text,
  actor_phone_hash text,
  decision text NOT NULL CHECK (decision IN ('approve', 'reject', 'review', 'execute', 'invalid')),
  accepted boolean NOT NULL DEFAULT false,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approval_attempts_ticket ON approval_attempts (ticket_id, created_at DESC);

CREATE TABLE IF NOT EXISTS approval_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  ticket_id uuid NOT NULL REFERENCES approval_tickets(id),
  proposal_id uuid REFERENCES ai_proposals(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'authorized', 'running', 'executed', 'failed', 'cancelled')),
  operation_type text NOT NULL,
  idempotency_key text NOT NULL,
  requested_by text,
  authorized_by text,
  authorized_at timestamptz,
  executed_at timestamptz,
  result jsonb,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_approval_executions_ticket ON approval_executions (ticket_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approval_executions_status ON approval_executions (tenant_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS approval_execution_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  execution_id uuid NOT NULL REFERENCES approval_executions(id) ON DELETE CASCADE,
  step_key text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  message text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approval_execution_steps_execution ON approval_execution_steps (execution_id, created_at);
`;
