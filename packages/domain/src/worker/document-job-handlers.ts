import type { WorkerJob, WorkerJobHandleResult } from "./model";
import type { WorkerJobHandler } from "./handler-registry";

function readPayload(job: WorkerJob): Record<string, unknown> {
  return job.payload && typeof job.payload === "object" ? (job.payload as Record<string, unknown>) : {};
}

function invalidPayload(reasons: string[]): WorkerJobHandleResult {
  return {
    ok: false,
    retryable: false,
    reasons: [...reasons, "mutation_executed:false", "provider_call_executed:false"]
  };
}

function deferredUnsupported(jobType: string, detail: string): WorkerJobHandleResult {
  return {
    ok: false,
    retryable: true,
    reasons: [
      "unsupported_renderer",
      `job_type:${jobType}`,
      detail,
      "mutation_executed:false",
      "provider_call_executed:false"
    ]
  };
}

function validateDocumentJobPayload(job: WorkerJob): { ok: true; tenantId: string; documentId: string; idempotencyKey: string } | { ok: false; result: WorkerJobHandleResult } {
  const payload = readPayload(job);
  const tenantId = typeof payload.tenantId === "string" ? payload.tenantId.trim() : job.tenantId;
  const documentId = typeof payload.documentId === "string" ? payload.documentId.trim() : "";
  const idempotencyKey =
    typeof payload.idempotencyKey === "string" && payload.idempotencyKey.trim().length > 0
      ? payload.idempotencyKey.trim()
      : job.idempotencyKey;

  if (!tenantId) {
    return { ok: false, result: invalidPayload(["missing_tenant_id"]) };
  }
  if (!documentId) {
    return { ok: false, result: invalidPayload(["missing_document_id"]) };
  }
  if (!idempotencyKey) {
    return { ok: false, result: invalidPayload(["missing_idempotency_key"]) };
  }

  return { ok: true, tenantId, documentId, idempotencyKey };
}

export function createDocumentRenderHandler(): WorkerJobHandler {
  return {
    jobType: "document_render",
    mode: "dry_run",
    productionAllowed: true,
    liveReady: false,
    handle: (job) => {
      const validated = validateDocumentJobPayload(job);
      if (!validated.ok) {
        return validated.result;
      }

      const rendererConfigured =
        typeof process.env.DOCUMENT_RENDERER_URL === "string" && process.env.DOCUMENT_RENDERER_URL.trim().length > 0;

      if (!rendererConfigured) {
        return deferredUnsupported("document_render", "renderer_not_configured");
      }

      return deferredUnsupported("document_render", "renderer_adapter_not_implemented");
    }
  };
}

export function createDocumentArchiveHandler(): WorkerJobHandler {
  return {
    jobType: "document_archive",
    mode: "dry_run",
    productionAllowed: true,
    liveReady: false,
    handle: (job) => {
      const validated = validateDocumentJobPayload(job);
      if (!validated.ok) {
        return validated.result;
      }

      const payload = readPayload(job);
      const sourceId =
        typeof payload.sourceId === "string" && payload.sourceId.trim().length > 0
          ? payload.sourceId.trim()
          : validated.documentId;

      if (!sourceId) {
        return invalidPayload(["missing_source_id"]);
      }

      const archiveRepositoryConfigured =
        process.env.PERSISTENCE_MODE === "postgres" && typeof process.env.DATABASE_URL === "string";

      if (!archiveRepositoryConfigured) {
        return deferredUnsupported("document_archive", "archive_repository_not_configured");
      }

      return deferredUnsupported("document_archive", "archive_repository_not_implemented");
    }
  };
}

export function listDocumentJobHandlers(): WorkerJobHandler[] {
  return [createDocumentRenderHandler(), createDocumentArchiveHandler()];
}
