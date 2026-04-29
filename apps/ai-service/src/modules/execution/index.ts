import { canExecuteApproval, executeApprovedOperation } from "@hallederiz/domain";
import type { Approval, ApprovalExecution, AiOperation } from "@hallederiz/types";

export function canExecute(approval: Approval) {
  return canExecuteApproval(approval);
}

export function buildExecutionResult(input: {
  approval: Approval;
  execution: ApprovalExecution;
  operation: AiOperation;
}) {
  if (!canExecute(input.approval)) {
    return {
      allowed: false,
      reason: "Approval execute kosullari saglanmadi."
    };
  }
  return {
    allowed: true,
    result: executeApprovedOperation(input)
  };
}
