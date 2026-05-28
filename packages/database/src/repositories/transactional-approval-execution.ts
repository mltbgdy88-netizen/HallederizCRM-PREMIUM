import type {
  ApprovalExecutionAuditEventDraftRecord,
  ApprovalExecutionLogEntryRecord,
  ApprovalExecutionTimelineEventDraftRecord
} from "./approval-execution-log-repository";
import type { DbWorkerJobRecord } from "./outbox-job-repository";
import type { DatabaseTransactionRunner } from "../transaction";

type MaybePromise<T> = T | Promise<T>;

export interface TransactionalApprovalExecutionRequest {
  tenantId: string;
  approvalRequestId: string;
  actionKey: string;
  actorId: string;
  approvedBy: string;
  payload: Record<string, unknown>;
  idempotencyKey: string;
  requestedAt: string;
  approvedAt: string;
}

export interface TransactionalApprovalExecutionResult {
  ok: boolean;
  status: "executed" | "blocked" | "unsupported_action" | "duplicate" | "failed";
  actionKey: string;
  approvalRequestId: string;
  executionId: string;
  reasons: string[];
  auditRequired: boolean;
  timelineRequired: boolean;
  idempotencyKey: string;
  handlerKey: string;
  handlerMode: "noop" | "dry_run" | "execute";
  executionLog: ApprovalExecutionLogEntryRecord;
  auditEvent?: ApprovalExecutionAuditEventDraftRecord;
  timelineEvent?: ApprovalExecutionTimelineEventDraftRecord;
  persistenceMode?: "none" | "repository";
  persistenceSkipped?: boolean;
  requestedMode?: "noop" | "dry_run" | "execute";
  effectiveMode?: "noop" | "dry_run" | "execute";
  gateDecision?: unknown;
  mutationExecuted?: boolean;
  externalProviderCallExecuted?: boolean;
  rollbackPlan?: string;
  foundationControlledExecution?: boolean;
}

export interface TransactionalApprovalExecutionLogRepositoryContract {
  saveExecutionLog: (entry: ApprovalExecutionLogEntryRecord) => MaybePromise<ApprovalExecutionLogEntryRecord>;
  saveAuditEventDraft: (
    event: ApprovalExecutionAuditEventDraftRecord
  ) => MaybePromise<ApprovalExecutionAuditEventDraftRecord>;
  saveTimelineEventDraft: (
    event: ApprovalExecutionTimelineEventDraftRecord
  ) => MaybePromise<ApprovalExecutionTimelineEventDraftRecord>;
}

export interface TransactionalOutboxRepositoryContract {
  enqueue: (job: DbWorkerJobRecord) => MaybePromise<DbWorkerJobRecord>;
  findByIdempotencyKey: (tenantId: string, idempotencyKey: string) => MaybePromise<DbWorkerJobRecord | undefined>;
}

export interface OutboxJobConfig {
  jobType: "approval.execution.dispatch" | "audit.timeline.writeback" | "notification.dispatch";
  maxAttempts: number;
  availableAt?: string;
}

export interface ExecuteApprovalWithOutboxBridgeOptions {
  dispatchApprovedAction?: (request: TransactionalApprovalExecutionRequest) => MaybePromise<TransactionalApprovalExecutionResult>;
  transactionRunner?: DatabaseTransactionRunner;
  approvalExecutionRepository?: TransactionalApprovalExecutionLogRepositoryContract;
  outboxRepository?: TransactionalOutboxRepositoryContract;
  outboxJobConfig?: Partial<OutboxJobConfig>;
}

export interface ExecuteApprovalWithOutboxBridgeResult {
  ok: boolean;
  status: "executed" | "failed" | "unsupported";
  executionResult?: TransactionalApprovalExecutionResult;
  executionLogPersisted: boolean;
  auditEventPersisted: boolean;
  timelineEventPersisted: boolean;
  outboxJobEnqueued: boolean;
  outboxDuplicate: boolean;
  outboxJob?: DbWorkerJobRecord;
  outboxJobId?: string;
  auditTimelineWritebackPayload?: Record<string, unknown>;
  auditTimelineWritebackQueued?: boolean;
  transactionMode: "transaction" | "unsupported";
  persistenceMode: "repository" | "none";
  reasons: string[];
}

function assertNonEmpty(value: string, fieldName: string) {
  if (!value) {
    throw new Error(`missing_${fieldName}`);
  }
}

function createOutboxJobId(tenantId: string, idempotencyKey: string) {
  const compactTenant = tenantId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12) || "tenant";
  const compactIdempotency = idempotencyKey.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16) || "idem";
  return `job_${compactTenant}_${compactIdempotency}`;
}

function normalizeOutboxConfig(config?: Partial<OutboxJobConfig>): OutboxJobConfig {
  return {
    jobType: config?.jobType ?? "approval.execution.dispatch",
    maxAttempts: config?.maxAttempts ?? 3,
    availableAt: config?.availableAt
  };
}

function createFailedResult(input: {
  request: TransactionalApprovalExecutionRequest;
  transactionMode: "transaction" | "unsupported";
  persistenceMode: "repository" | "none";
  reasons: string[];
  executionResult?: TransactionalApprovalExecutionResult;
}): ExecuteApprovalWithOutboxBridgeResult {
  return {
    ok: false,
    status: input.transactionMode === "unsupported" ? "unsupported" : "failed",
    executionResult: input.executionResult,
    executionLogPersisted: false,
    auditEventPersisted: false,
    timelineEventPersisted: false,
    outboxJobEnqueued: false,
    outboxDuplicate: false,
    transactionMode: input.transactionMode,
    persistenceMode: input.persistenceMode,
    reasons: input.reasons
  };
}

export async function executeApprovalWithOutboxBridge(
  request: TransactionalApprovalExecutionRequest,
  options: ExecuteApprovalWithOutboxBridgeOptions
): Promise<ExecuteApprovalWithOutboxBridgeResult> {
  assertNonEmpty(request.tenantId, "tenant_id");
  assertNonEmpty(request.actionKey, "action_key");
  assertNonEmpty(request.approvalRequestId, "approval_request_id");
  assertNonEmpty(request.idempotencyKey, "idempotency_key");

  if (!options.dispatchApprovedAction) {
    return createFailedResult({
      request,
      transactionMode: "unsupported",
      persistenceMode: "none",
      reasons: ["missing_dispatch_approved_action"]
    });
  }

  if (!options.transactionRunner) {
    return createFailedResult({
      request,
      transactionMode: "unsupported",
      persistenceMode: "none",
      reasons: ["missing_transaction_runner"]
    });
  }

  if (!options.approvalExecutionRepository || !options.outboxRepository) {
    return createFailedResult({
      request,
      transactionMode: "unsupported",
      persistenceMode: "none",
      reasons: ["missing_bridge_repositories"]
    });
  }

  const outboxConfig = normalizeOutboxConfig(options.outboxJobConfig);
  if (outboxConfig.maxAttempts <= 0) {
    return createFailedResult({
      request,
      transactionMode: "unsupported",
      persistenceMode: "none",
      reasons: ["invalid_outbox_max_attempts"]
    });
  }

  try {
    return await options.transactionRunner.withTransaction(async () => {
      const executionResult = await options.dispatchApprovedAction!(request);
      if (!executionResult.ok || executionResult.status !== "executed") {
        return createFailedResult({
          request,
          transactionMode: "transaction",
          persistenceMode: "repository",
          reasons: ["execution_not_dispatchable", executionResult.status, ...executionResult.reasons],
          executionResult
        });
      }

      const savedExecutionLog = await options.approvalExecutionRepository!.saveExecutionLog(executionResult.executionLog);
      const savedAuditEvent = executionResult.auditEvent
        ? await options.approvalExecutionRepository!.saveAuditEventDraft(executionResult.auditEvent)
        : undefined;
      const savedTimelineEvent = executionResult.timelineEvent
        ? await options.approvalExecutionRepository!.saveTimelineEventDraft(executionResult.timelineEvent)
        : undefined;

      const outboxIdempotencyKey = `approval_outbox:${request.idempotencyKey}`;
      const existingOutboxJob = await options.outboxRepository!.findByIdempotencyKey(
        request.tenantId,
        outboxIdempotencyKey
      );

      let outboxJob = existingOutboxJob;
      let outboxJobEnqueued = false;
      let outboxDuplicate = false;
      const writebackPayload: Record<string, unknown> = {
        tenantId: request.tenantId,
        approvalRequestId: request.approvalRequestId,
        executionId: executionResult.executionId,
        actionKey: request.actionKey,
        idempotencyKey: request.idempotencyKey,
        auditEvent: savedAuditEvent
          ? {
              eventId: savedAuditEvent.eventId ?? `audit_${executionResult.executionId}`,
              eventKey: savedAuditEvent.eventKey,
              createdAt: savedAuditEvent.createdAt,
              payload: savedAuditEvent.payload
            }
          : undefined,
        timelineEvent: savedTimelineEvent
          ? {
              eventId: savedTimelineEvent.eventId ?? `timeline_${executionResult.executionId}`,
              eventKey: savedTimelineEvent.eventKey,
              createdAt: savedTimelineEvent.createdAt,
              payload: savedTimelineEvent.payload
            }
          : undefined
      };

      if (!existingOutboxJob) {
        const createdAt = new Date().toISOString();
        const draftPayload: Record<string, unknown> = {
          tenantId: request.tenantId,
          actionKey: request.actionKey,
          approvalRequestId: request.approvalRequestId,
          executionId: executionResult.executionId,
          idempotencyKey: request.idempotencyKey,
          approvedContext: true,
          mode: executionResult.handlerMode,
          requestedMode: executionResult.requestedMode ?? executionResult.handlerMode,
          effectiveMode: executionResult.effectiveMode ?? executionResult.handlerMode,
          gateDecision: executionResult.gateDecision,
          mutationExecuted: executionResult.mutationExecuted ?? false,
          externalProviderCallExecuted: executionResult.externalProviderCallExecuted ?? false,
          rollbackPlan: executionResult.rollbackPlan,
          foundationControlledExecution: executionResult.foundationControlledExecution ?? false,
          executionStatus: executionResult.status,
          auditRequired: executionResult.auditRequired,
          timelineRequired: executionResult.timelineRequired,
          auditEvent: savedAuditEvent
            ? {
                eventId: savedAuditEvent.eventId ?? `audit_${executionResult.executionId}`,
                eventKey: savedAuditEvent.eventKey,
                createdAt: savedAuditEvent.createdAt
              }
            : undefined,
          timelineEvent: savedTimelineEvent
            ? {
                eventId: savedTimelineEvent.eventId ?? `timeline_${executionResult.executionId}`,
                eventKey: savedTimelineEvent.eventKey,
                createdAt: savedTimelineEvent.createdAt
              }
            : undefined,
          auditTimelineWritebackPayload: writebackPayload,
          dryRunFoundation: executionResult.handlerMode !== "execute"
        };

        outboxJob = await options.outboxRepository!.enqueue({
          jobId: createOutboxJobId(request.tenantId, outboxIdempotencyKey),
          tenantId: request.tenantId,
          jobType: outboxConfig.jobType,
          actionKey: request.actionKey,
          payload: draftPayload,
          status: "pending",
          attempts: 0,
          maxAttempts: outboxConfig.maxAttempts,
          idempotencyKey: outboxIdempotencyKey,
          availableAt: outboxConfig.availableAt ?? createdAt,
          createdAt,
          updatedAt: createdAt
        });
        outboxJobEnqueued = true;
      } else {
        outboxDuplicate = true;
      }

      return {
        ok: true,
        status: "executed",
        executionResult: {
          ...executionResult,
          executionLog: savedExecutionLog,
          auditEvent: savedAuditEvent,
          timelineEvent: savedTimelineEvent,
          persistenceMode: "repository",
          persistenceSkipped: false
        },
        executionLogPersisted: true,
        auditEventPersisted: Boolean(savedAuditEvent),
        timelineEventPersisted: Boolean(savedTimelineEvent),
        outboxJobEnqueued,
        outboxDuplicate,
        outboxJob,
        outboxJobId: outboxJob?.jobId,
        auditTimelineWritebackPayload: writebackPayload,
        auditTimelineWritebackQueued: outboxJobEnqueued,
        transactionMode: "transaction",
        persistenceMode: "repository",
        reasons: outboxDuplicate ? ["outbox_duplicate_idempotency"] : ["bridge_completed"]
      } satisfies ExecuteApprovalWithOutboxBridgeResult;
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "transactional_bridge_failed";
    return createFailedResult({
      request,
      transactionMode: "transaction",
      persistenceMode: "repository",
      reasons: ["transactional_bridge_failed", reason]
    });
  }
}
