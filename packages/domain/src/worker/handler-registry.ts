import type { WorkerHandlerMode, WorkerJob, WorkerJobHandleResult } from "./model";

export interface WorkerJobHandler {
  jobType: string;
  mode: WorkerHandlerMode;
  handle: (job: WorkerJob) => WorkerJobHandleResult;
}

const registry = new Map<string, WorkerJobHandler>();

function createFoundationHandler(jobType: string): WorkerJobHandler {
  if (jobType === "approval.execution.dispatch") {
    return {
      jobType,
      mode: "dry_run",
      handle: (job) => {
        const payload = job.payload ?? {};
        const hasTenantId = typeof payload.tenantId === "string" && payload.tenantId.length > 0;
        const hasActionKey = typeof payload.actionKey === "string" && payload.actionKey.length > 0;
        const hasApprovalRequestId =
          typeof payload.approvalRequestId === "string" && payload.approvalRequestId.length > 0;
        const hasExecutionId = typeof payload.executionId === "string" && payload.executionId.length > 0;

        if (!hasTenantId || !hasActionKey || !hasApprovalRequestId || !hasExecutionId) {
          return {
            ok: false,
            retryable: false,
            reasons: [
              "invalid_approval_execution_dispatch_payload",
              "non_retryable_missing_required_payload",
              "mutation_executed:false",
              "provider_call_executed:false"
            ]
          };
        }

        return {
          ok: true,
          retryable: false,
          reasons: [
            "approval_execution_dispatch_dry_run_handled",
            "handled:true",
            "mode:dry_run",
            "mutation_executed:false",
            "provider_call_executed:false"
          ]
        };
      }
    };
  }

  return {
    jobType,
    mode: "dry_run",
    handle: () => ({
      ok: true,
      retryable: false,
      reasons: [
        "foundation_handler_dry_run",
        "no_real_provider_or_mutation_execution"
      ]
    })
  };
}

function registerDefaults() {
  registerWorkerJobHandler(createFoundationHandler("approval.execution.dispatch"));
  registerWorkerJobHandler(createFoundationHandler("audit.timeline.writeback"));
  registerWorkerJobHandler(createFoundationHandler("notification.dispatch"));
}

registerDefaults();

export function registerWorkerJobHandler(handler: WorkerJobHandler) {
  registry.set(handler.jobType, handler);
}

export function getWorkerJobHandler(jobType: string): WorkerJobHandler | undefined {
  return registry.get(jobType);
}

export function hasWorkerJobHandler(jobType: string): boolean {
  return registry.has(jobType);
}

export function listWorkerJobHandlers(): WorkerJobHandler[] {
  return [...registry.values()];
}

export function resetWorkerJobHandlers() {
  registry.clear();
  registerDefaults();
}
