import type { WorkerJobHandleResult, WorkerHandlerStatus } from "./model";

export function deferredHandlerResult(
  jobType: string,
  detail: string,
  options?: { retryable?: boolean; entityType?: string; entityId?: string }
): WorkerJobHandleResult {
  return normalizeHandlerResult({
    ok: false,
    status: "deferred",
    mutation_executed: false,
    retryable: options?.retryable ?? true,
    reasons: [
      "handler_deferred",
      `job_type:${jobType}`,
      detail,
      "mutation_executed:false",
      "provider_call_executed:false"
    ],
    entityType: options?.entityType,
    entityId: options?.entityId
  });
}

export function failedHandlerResult(jobType: string, detail: string, retryable = false): WorkerJobHandleResult {
  return normalizeHandlerResult({
    ok: false,
    status: "failed",
    mutation_executed: false,
    retryable,
    reasons: ["handler_failed", `job_type:${jobType}`, detail, "mutation_executed:false", "provider_call_executed:false"]
  });
}

export function invalidPayloadResult(reasons: string[]): WorkerJobHandleResult {
  return normalizeHandlerResult({
    ok: false,
    status: "failed",
    mutation_executed: false,
    retryable: false,
    reasons: [...reasons, "mutation_executed:false", "provider_call_executed:false"]
  });
}

export function completedHandlerResult(options: {
  jobType: string;
  entityType?: string;
  entityId?: string;
  reasons?: string[];
  metadata?: Record<string, unknown>;
}): WorkerJobHandleResult {
  return normalizeHandlerResult({
    ok: true,
    status: "completed",
    mutation_executed: true,
    retryable: false,
    entityType: options.entityType,
    entityId: options.entityId,
    metadata: options.metadata,
    reasons: [
      "handler_completed",
      `job_type:${options.jobType}`,
      "mutation_executed:true",
      "provider_call_executed:false",
      ...(options.reasons ?? [])
    ]
  });
}

/** Enforces: completed only when mutation_executed is true; ok:true never without mutation. */
export function normalizeHandlerResult(result: WorkerJobHandleResult): WorkerJobHandleResult {
  const mutationExecuted = result.mutation_executed === true;
  let status: WorkerHandlerStatus =
    result.status ?? (mutationExecuted ? "completed" : result.ok ? "deferred" : "deferred");

  if (status === "completed" && !mutationExecuted) {
    status = "deferred";
  }

  if (result.ok && !mutationExecuted) {
    return {
      ...result,
      ok: false,
      status: "deferred",
      mutation_executed: false,
      reasons: [
        ...(result.reasons ?? []),
        "completion_blocked_without_mutation",
        "mutation_executed:false"
      ]
    };
  }

  if (mutationExecuted && status === "completed") {
    return {
      ...result,
      ok: true,
      status: "completed",
      mutation_executed: true
    };
  }

  return {
    ...result,
    ok: result.ok && mutationExecuted,
    status,
    mutation_executed: mutationExecuted
  };
}

export function isWorkerJobCompletable(result: WorkerJobHandleResult): boolean {
  const normalized = normalizeHandlerResult(result);
  return normalized.ok === true && normalized.status === "completed" && normalized.mutation_executed === true;
}
