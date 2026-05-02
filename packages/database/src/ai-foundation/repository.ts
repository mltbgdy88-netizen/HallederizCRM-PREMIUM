import type { QueryExecutor } from "../types";
import type {
  AiProposalInsert,
  AiProposalOperationInsert,
  AiProposalValidationInsert,
  AiPromptAuditInsert,
  ApprovalAttemptInsert,
  ApprovalExecutionInsert,
  ApprovalExecutionStepInsert,
  ApprovalPolicyInsert,
  ApprovalTicketInsert,
  AuditEventInsert,
  IdempotencyKeyInsert,
  InboxEventInsert,
  OutboxEventInsert,
} from "./types";

interface InsertStatement {
  sql: string;
  params: unknown[];
}

function jsonb(value: unknown): string {
  return JSON.stringify(value ?? {});
}

function jsonbArray(value: unknown[] | undefined): string {
  return JSON.stringify(value ?? []);
}

export function buildInsertAuditEvent(input: AuditEventInsert): InsertStatement {
  return {
    sql: `INSERT INTO audit_events (tenant_id, actor_user_id, action, entity_type, entity_id, correlation_id, request_id, source, severity, summary, payload_redacted)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb)
          RETURNING id`,
    params: [input.tenantId, input.actorUserId ?? null, input.action, input.entityType, input.entityId, input.correlationId ?? null, input.requestId ?? null, input.source ?? "system", input.severity ?? "info", input.summary, jsonb(input.payloadRedacted)],
  };
}

export function buildInsertOutboxEvent(input: OutboxEventInsert): InsertStatement {
  return {
    sql: `INSERT INTO outbox_events (tenant_id, event_type, aggregate_type, aggregate_id, idempotency_key, payload, max_attempts, next_attempt_at)
          VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,COALESCE($8::timestamptz, now()))
          ON CONFLICT (tenant_id, idempotency_key) DO NOTHING
          RETURNING id`,
    params: [input.tenantId, input.eventType, input.aggregateType, input.aggregateId, input.idempotencyKey, jsonb(input.payload), input.maxAttempts ?? 5, input.nextAttemptAt ?? null],
  };
}

export function buildInsertInboxEvent(input: InboxEventInsert): InsertStatement {
  return {
    sql: `INSERT INTO inbox_events (tenant_id, provider, provider_event_id, content_hash, payload_redacted)
          VALUES ($1,$2,$3,$4,$5::jsonb)
          ON CONFLICT (tenant_id, provider, provider_event_id) DO UPDATE SET status = 'duplicate'
          RETURNING id, status`,
    params: [input.tenantId, input.provider, input.providerEventId, input.contentHash ?? null, jsonb(input.payloadRedacted)],
  };
}

export function buildReserveIdempotencyKey(input: IdempotencyKeyInsert): InsertStatement {
  return {
    sql: `INSERT INTO idempotency_keys (tenant_id, scope, key, expires_at, result_ref_type, result_ref_id)
          VALUES ($1,$2,$3,$4::timestamptz,$5,$6)
          ON CONFLICT (tenant_id, scope, key) DO NOTHING
          RETURNING id, status`,
    params: [input.tenantId, input.scope, input.key, input.expiresAt, input.resultRefType ?? null, input.resultRefId ?? null],
  };
}

export function buildInsertAiProposal(input: AiProposalInsert): InsertStatement {
  return {
    sql: `INSERT INTO ai_proposals (tenant_id, proposal_no, session_id, source, status, schema_version, language, reply, confidence, risk_level, requires_approval, needs_clarification, clarification_question, requested_by, validated_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,now())
          RETURNING id`,
    params: [input.tenantId, input.proposalNo, input.sessionId ?? null, input.source ?? "crm_ui", input.status ?? (input.requiresApproval ? "waiting_approval" : "draft"), input.schemaVersion, input.language ?? "tr-TR", input.reply, input.confidence, input.riskLevel, input.requiresApproval, input.needsClarification ?? false, input.clarificationQuestion ?? null, input.requestedBy ?? null],
  };
}

export function buildInsertAiProposalOperation(input: AiProposalOperationInsert): InsertStatement {
  return {
    sql: `INSERT INTO ai_proposal_operations (tenant_id, proposal_id, operation_type, risk_class, idempotency_key, summary, requires_approval, confidence, target, payload, reasons, sort_order)
          VALUES ($1,$2::uuid,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11::jsonb,$12)
          RETURNING id`,
    params: [input.tenantId, input.proposalId, input.operationType, input.riskClass, input.idempotencyKey, input.summary, input.requiresApproval, input.confidence, input.target ? jsonb(input.target) : null, jsonb(input.payload), jsonbArray(input.reasons), input.sortOrder ?? 0],
  };
}

export function buildInsertAiProposalValidation(input: AiProposalValidationInsert): InsertStatement {
  return {
    sql: `INSERT INTO ai_proposal_validations (tenant_id, proposal_id, status, validator, issues)
          VALUES ($1,$2::uuid,$3,$4,$5::jsonb)
          RETURNING id`,
    params: [input.tenantId, input.proposalId ?? null, input.status, input.validator, jsonbArray(input.issues)],
  };
}

export function buildInsertAiPromptAudit(input: AiPromptAuditInsert): InsertStatement {
  return {
    sql: `INSERT INTO ai_prompt_audit (tenant_id, proposal_id, prompt_hash, snapshot_hash, model_provider, model_name, pii_minimized)
          VALUES ($1,$2::uuid,$3,$4,$5,$6,$7)
          RETURNING id`,
    params: [input.tenantId, input.proposalId ?? null, input.promptHash, input.snapshotHash, input.modelProvider ?? "local-ai-service", input.modelName ?? null, input.piiMinimized ?? true],
  };
}

export function buildInsertApprovalPolicy(input: ApprovalPolicyInsert): InsertStatement {
  return {
    sql: `INSERT INTO approval_policies (tenant_id, operation_type, required_role, min_approver_count, risk_level, active)
          VALUES ($1,$2,$3,$4,$5,$6)
          ON CONFLICT (tenant_id, operation_type, required_role) DO UPDATE SET min_approver_count = EXCLUDED.min_approver_count, risk_level = EXCLUDED.risk_level, active = EXCLUDED.active, updated_at = now()
          RETURNING id`,
    params: [input.tenantId, input.operationType, input.requiredRole, input.minApproverCount ?? 1, input.riskLevel ?? "medium", input.active ?? true],
  };
}

export function buildInsertApprovalTicket(input: ApprovalTicketInsert): InsertStatement {
  return {
    sql: `INSERT INTO approval_tickets (tenant_id, ticket_no, policy_id, source_type, source_id, operation_type, status, required_role, requested_by, expires_at, risk_level, payload_summary, payload)
          VALUES ($1,$2,$3::uuid,$4,$5,$6,$7,$8,$9,$10::timestamptz,$11,$12,$13::jsonb)
          RETURNING id`,
    params: [input.tenantId, input.ticketNo, input.policyId ?? null, input.sourceType, input.sourceId, input.operationType, input.status ?? "pending", input.requiredRole, input.requestedBy ?? null, input.expiresAt ?? null, input.riskLevel ?? "medium", input.payloadSummary, jsonb(input.payload)],
  };
}

export function buildInsertApprovalAttempt(input: ApprovalAttemptInsert): InsertStatement {
  return {
    sql: `INSERT INTO approval_attempts (tenant_id, ticket_id, actor_user_id, actor_phone_hash, decision, accepted, reason)
          VALUES ($1,$2::uuid,$3,$4,$5,$6,$7)
          RETURNING id`,
    params: [input.tenantId, input.ticketId, input.actorUserId ?? null, input.actorPhoneHash ?? null, input.decision, input.accepted, input.reason ?? null],
  };
}

export function buildInsertApprovalExecution(input: ApprovalExecutionInsert): InsertStatement {
  return {
    sql: `INSERT INTO approval_executions (tenant_id, ticket_id, proposal_id, status, operation_type, idempotency_key, requested_by, authorized_by, authorized_at)
          VALUES ($1,$2::uuid,$3::uuid,$4,$5,$6,$7,$8,$9::timestamptz)
          ON CONFLICT (tenant_id, idempotency_key) DO NOTHING
          RETURNING id`,
    params: [input.tenantId, input.ticketId, input.proposalId ?? null, input.status ?? "pending", input.operationType, input.idempotencyKey, input.requestedBy ?? null, input.authorizedBy ?? null, input.authorizedAt ?? null],
  };
}

export function buildInsertApprovalExecutionStep(input: ApprovalExecutionStepInsert): InsertStatement {
  return {
    sql: `INSERT INTO approval_execution_steps (tenant_id, execution_id, step_key, status, message, payload, started_at, completed_at)
          VALUES ($1,$2::uuid,$3,$4,$5,$6::jsonb,$7::timestamptz,$8::timestamptz)
          RETURNING id`,
    params: [input.tenantId, input.executionId, input.stepKey, input.status, input.message ?? null, jsonb(input.payload), input.startedAt ?? null, input.completedAt ?? null],
  };
}

export interface AiFoundationRepository {
  recordAuditEvent(input: AuditEventInsert): Promise<string | undefined>;
  enqueueOutboxEvent(input: OutboxEventInsert): Promise<string | undefined>;
  reserveInboxEvent(input: InboxEventInsert): Promise<{ id?: string; status?: string }>;
  reserveIdempotencyKey(input: IdempotencyKeyInsert): Promise<{ id?: string; status?: string }>;
  createAiProposal(input: AiProposalInsert): Promise<string | undefined>;
  createAiProposalOperation(input: AiProposalOperationInsert): Promise<string | undefined>;
  createApprovalTicket(input: ApprovalTicketInsert): Promise<string | undefined>;
}

export function createAiFoundationRepository(executor: QueryExecutor): AiFoundationRepository {
  async function insertReturningId(statement: InsertStatement): Promise<string | undefined> {
    const rows = await executor.query<{ id?: string }>(statement.sql, statement.params);
    return rows[0]?.id;
  }

  return {
    recordAuditEvent: (input) => insertReturningId(buildInsertAuditEvent(input)),
    enqueueOutboxEvent: (input) => insertReturningId(buildInsertOutboxEvent(input)),
    async reserveInboxEvent(input) {
      const statement = buildInsertInboxEvent(input);
      const rows = await executor.query<{ id?: string; status?: string }>(statement.sql, statement.params);
      return rows[0] ?? {};
    },
    async reserveIdempotencyKey(input) {
      const statement = buildReserveIdempotencyKey(input);
      const rows = await executor.query<{ id?: string; status?: string }>(statement.sql, statement.params);
      return rows[0] ?? {};
    },
    createAiProposal: (input) => insertReturningId(buildInsertAiProposal(input)),
    createAiProposalOperation: (input) => insertReturningId(buildInsertAiProposalOperation(input)),
    createApprovalTicket: (input) => insertReturningId(buildInsertApprovalTicket(input)),
  };
}
