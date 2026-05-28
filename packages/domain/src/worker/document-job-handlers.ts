import type { WorkerJob, WorkerJobHandleResult } from "./model";
import type { WorkerJobHandler } from "./handler-registry";
import { completedHandlerResult, deferredHandlerResult, invalidPayloadResult } from "./handle-result";
import { getWorkerDomainExecutionPort } from "./execution-port";

function readPayload(job: WorkerJob): Record<string, unknown> {
  return job.payload && typeof job.payload === "object" ? (job.payload as Record<string, unknown>) : {};
}

function validateDocumentJobPayload(job: WorkerJob): { ok: true; tenantId: string; documentId: string; idempotencyKey: string } | { ok: false; result: ReturnType<typeof invalidPayloadResult> } {
  const payload = readPayload(job);
  const tenantId = typeof payload.tenantId === "string" ? payload.tenantId.trim() : job.tenantId;
  const documentId = typeof payload.documentId === "string" ? payload.documentId.trim() : "";
  const idempotencyKey =
    typeof payload.idempotencyKey === "string" && payload.idempotencyKey.trim().length > 0
      ? payload.idempotencyKey.trim()
      : job.idempotencyKey;

  if (!tenantId) {
    return { ok: false, result: invalidPayloadResult(["missing_tenant_id"]) };
  }
  if (!documentId) {
    return { ok: false, result: invalidPayloadResult(["missing_document_id"]) };
  }
  if (!idempotencyKey) {
    return { ok: false, result: invalidPayloadResult(["missing_idempotency_key"]) };
  }

  return { ok: true, tenantId, documentId, idempotencyKey };
}

function handleDocumentJob(job: WorkerJob, jobType: "document_render" | "document_archive"): WorkerJobHandleResult {
  const validated = validateDocumentJobPayload(job);
  if (!validated.ok) {
    return validated.result;
  }

  const port = getWorkerDomainExecutionPort();
  if (!port) {
    return deferredHandlerResult(jobType, "domain_execution_port_not_registered", {
      entityType: "document",
      entityId: validated.documentId
    });
  }

  const payload = readPayload(job);
  const dispatch = port({
    jobType,
    tenantId: validated.tenantId,
    actionKey: typeof payload.actionKey === "string" ? payload.actionKey : undefined,
    payload: {
      ...payload,
      tenantId: validated.tenantId,
      documentId: validated.documentId,
      idempotencyKey: validated.idempotencyKey,
      sourceId:
        typeof payload.sourceId === "string" && payload.sourceId.trim().length > 0
          ? payload.sourceId.trim()
          : validated.documentId
    },
    idempotencyKey: validated.idempotencyKey
  });

  if (dispatch.status === "completed" && dispatch.mutation_executed) {
    return completedHandlerResult({
      jobType,
      entityType: "document",
      entityId: validated.documentId,
      reasons: ["document_job_completed", ...dispatch.reasons]
    });
  }

  return deferredHandlerResult(jobType, dispatch.reasons[0] ?? "document_execution_deferred", {
    entityType: "document",
    entityId: validated.documentId
  });
}

export function createDocumentRenderHandler(): WorkerJobHandler {
  return {
    jobType: "document_render",
    mode: "execute",
    productionAllowed: true,
    liveReady: true,
    handle: (job) => handleDocumentJob(job, "document_render")
  };
}

export function createDocumentArchiveHandler(): WorkerJobHandler {
  return {
    jobType: "document_archive",
    mode: "execute",
    productionAllowed: true,
    liveReady: true,
    handle: (job) => handleDocumentJob(job, "document_archive")
  };
}

export function listDocumentJobHandlers(): WorkerJobHandler[] {
  return [createDocumentRenderHandler(), createDocumentArchiveHandler()];
}
