import type { AiExecutionResult, AiOperation, Approval, ApprovalExecution } from "@hallederiz/types";
import { validateAiMutationGuard } from "../ai";
export * from "./dispatcher";
export * from "./handler-registry";
export * from "./execution-log";
export * from "./persistence";
export * from "./audit-timeline-writeback";
export * from "./execution-gate";
export * from "./production-safety";

export function canExecuteApproval(approval: Approval): boolean {
  return approval.status === "approved" && approval.execution.executable && Boolean(approval.policySnapshot.serverActionKey);
}

export function executeApprovedOperation(input: { approval: Approval; execution: ApprovalExecution; operation: AiOperation }): ApprovalExecution {
  const guard = validateAiMutationGuard([input.operation], input.approval);
  const now = new Date().toISOString();
  const result: AiExecutionResult = { id: `ai_exec_result_${input.execution.id}`, tenantId: input.execution.tenantId, proposalId: input.execution.proposalId ?? input.approval.entityId, operationId: input.operation.id, status: guard.allowed && canExecuteApproval(input.approval) ? "completed" : "failed", message: guard.allowed ? `Mock server-side operation executed: ${input.operation.type}` : guard.reason, startedAt: now, completedAt: now, auditEventId: `audit_${input.execution.id}` };
  return { ...input.execution, status: result.status === "completed" ? "executed" : "failed", executedAt: now, result };
}
