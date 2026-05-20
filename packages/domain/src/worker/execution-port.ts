export interface WorkerDomainExecutionRequest {
  jobType: string;
  tenantId: string;
  actionKey?: string;
  payload: Record<string, unknown>;
  idempotencyKey: string;
}

export interface WorkerDomainExecutionResult {
  status: "completed" | "deferred" | "failed";
  mutation_executed: boolean;
  entityType?: string;
  entityId?: string;
  reasons: string[];
  metadata?: Record<string, unknown>;
}

export type WorkerDomainExecutionPort = (request: WorkerDomainExecutionRequest) => WorkerDomainExecutionResult;

let executionPort: WorkerDomainExecutionPort | undefined;

export function registerWorkerDomainExecutionPort(port: WorkerDomainExecutionPort): void {
  executionPort = port;
}

export function getWorkerDomainExecutionPort(): WorkerDomainExecutionPort | undefined {
  return executionPort;
}

export function resetWorkerDomainExecutionPort(): void {
  executionPort = undefined;
}

export function routeApprovalExecutionAction(actionKey: string): string | undefined {
  if (actionKey.startsWith("platform.documents.")) {
    if (actionKey.includes("regenerate") || actionKey.includes("render")) {
      return "document_render";
    }
    if (actionKey.includes("send")) {
      return "document_render";
    }
    if (actionKey.includes("archive")) {
      return "document_archive";
    }
  }
  if (actionKey === "platform.omnichannel.ai_reply.approve") {
    return "ai_reply_send";
  }
  if (actionKey.startsWith("platform.") && (actionKey.includes("erp") || actionKey.includes("integration"))) {
    return "integration_sync";
  }
  return "approval_execution";
}
