import {
  registerWorkerDomainExecutionPort,
  type WorkerDomainExecutionPort,
  type WorkerDomainExecutionRequest,
  type WorkerDomainExecutionResult
} from "@hallederiz/domain";
import {
  createQueryExecutor,
  DatabaseApprovalExecutionLogRepository,
  type ApprovalExecutionLogEntryRecord
} from "@hallederiz/database";

export interface ApprovalExecutionLogReader {
  getExecutionLogForTenant(
    tenantId: string,
    executionId: string
  ): Promise<ApprovalExecutionLogEntryRecord | undefined>;
}

function readRequiredString(payload: Record<string, unknown>, key: string): string | undefined {
  const value = payload[key];
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function failed(reason: string): WorkerDomainExecutionResult {
  return {
    status: "failed",
    mutation_executed: false,
    reasons: [reason, "mutation_executed:false", "provider_call_executed:false"]
  };
}

function deferred(reason: string): WorkerDomainExecutionResult {
  return {
    status: "deferred",
    mutation_executed: false,
    reasons: [reason, "mutation_executed:false", "provider_call_executed:false"]
  };
}

export function createApprovalExecutionConfirmationPort(
  repository: ApprovalExecutionLogReader
): WorkerDomainExecutionPort {
  return async (request: WorkerDomainExecutionRequest): Promise<WorkerDomainExecutionResult> => {
    if (request.jobType !== "approval.execution.dispatch" && request.jobType !== "audit.timeline.writeback") {
      return failed("worker_execution_job_type_not_allowlisted");
    }

    const payloadTenantId = readRequiredString(request.payload, "tenantId");
    const executionId = readRequiredString(request.payload, "executionId");
    const approvalRequestId = readRequiredString(request.payload, "approvalRequestId");
    const actionKey = readRequiredString(request.payload, "actionKey");
    const executionIdempotencyKey = readRequiredString(request.payload, "idempotencyKey");

    if (!payloadTenantId || !executionId || !approvalRequestId || !actionKey || !executionIdempotencyKey) {
      return failed("invalid_approval_execution_confirmation_payload");
    }
    if (payloadTenantId !== request.tenantId) {
      return failed("worker_execution_tenant_mismatch");
    }

    let entry: ApprovalExecutionLogEntryRecord | undefined;
    try {
      entry = await repository.getExecutionLogForTenant(request.tenantId, executionId);
    } catch {
      return deferred("approval_execution_log_read_failed");
    }

    if (!entry) {
      return deferred("approval_execution_log_not_visible");
    }
    if (
      entry.tenantId !== request.tenantId ||
      entry.approvalRequestId !== approvalRequestId ||
      entry.actionKey !== actionKey ||
      entry.idempotencyKey !== executionIdempotencyKey
    ) {
      return failed("approval_execution_log_identity_mismatch");
    }
    if (entry.status !== "executed" || entry.mode !== "execute" || entry.handlerMode !== "execute") {
      return failed("approval_execution_not_executed");
    }
    if (!entry.reasons.includes("mutation_executed:true")) {
      return failed("approval_execution_mutation_evidence_missing");
    }
    if (!entry.auditRequired || !entry.timelineRequired) {
      return failed("approval_execution_audit_timeline_contract_missing");
    }

    return {
      status: "completed",
      mutation_executed: true,
      entityType: "approval_execution",
      entityId: entry.executionId,
      auditEventId: `audit_${entry.executionId}`,
      timelineEventId: `timeline_${entry.executionId}`,
      reasons: [
        "approval_execution_persistence_verified",
        "audit_timeline_persistence_verified",
        "provider_call_executed:false"
      ],
      metadata: {
        tenantId: entry.tenantId,
        approvalRequestId: entry.approvalRequestId,
        actionKey: entry.actionKey,
        executionId: entry.executionId,
        idempotencyKey: entry.idempotencyKey,
        auditEventId: `audit_${entry.executionId}`,
        timelineEventId: `timeline_${entry.executionId}`,
        executionVerified: true
      }
    };
  };
}

export function registerApprovalExecutionConfirmationPort(postgresUrl: string): void {
  const repository = new DatabaseApprovalExecutionLogRepository({
    executor: createQueryExecutor({ mode: "postgres", postgresUrl }),
    persistenceMode: "postgres"
  });
  registerWorkerDomainExecutionPort(createApprovalExecutionConfirmationPort(repository));
}
