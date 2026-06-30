import assert from "node:assert/strict";
import test from "node:test";
import {
  createDocumentArchiveHandler,
  createDocumentRenderHandler,
  type WorkerJob
} from "@hallederiz/domain";
import { listDocuments } from "../commercial-operations/mock-store";
import { bootstrapWorkerDomainExecutionPort } from "../shared/worker-domain-execution-port";

function buildJob(overrides: Partial<WorkerJob> = {}): WorkerJob {
  return {
    jobId: "job_1",
    tenantId: "tenant_1",
    jobType: "document_render",
    actionKey: "document.render",
    payload: {
      tenantId: "tenant_1",
      documentId: "document_1",
      idempotencyKey: "idem_1"
    },
    status: "pending",
    attempts: 0,
    maxAttempts: 3,
    idempotencyKey: "idem_1",
    availableAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
}

test("document_render rejects missing documentId", () => {
  const handler = createDocumentRenderHandler();
  const result = handler.handle(
    buildJob({
      payload: { tenantId: "tenant_1", idempotencyKey: "idem_1" }
    })
  );
  assert.equal(result.ok, false);
  assert.ok(result.reasons?.includes("missing_document_id"));
});

test("document_render does not complete without renderer", () => {
  const handler = createDocumentRenderHandler();
  const result = handler.handle(buildJob());
  assert.equal(result.ok, false);
  assert.ok(
    result.reasons?.some(
      (reason) => reason.includes("renderer") || reason.includes("domain_execution_port_not_registered")
    )
  );
});

test("document_archive rejects missing documentId", () => {
  const handler = createDocumentArchiveHandler();
  const result = handler.handle(
    buildJob({
      jobType: "document_archive",
      payload: { tenantId: "tenant_1", idempotencyKey: "idem_1" }
    })
  );
  assert.equal(result.ok, false);
  assert.ok(result.reasons?.includes("missing_document_id"));
});

test("document_archive completes foundation archive job when document exists", () => {
  const archiveDocument = listDocuments()[0];
  assert.ok(archiveDocument);
  const previousMode = process.env.PERSISTENCE_MODE;
  const previousDb = process.env.DATABASE_URL;
  process.env.PERSISTENCE_MODE = "postgres";
  process.env.DATABASE_URL = "postgres://example";
  bootstrapWorkerDomainExecutionPort();
  const handler = createDocumentArchiveHandler();
  const result = handler.handle(
    buildJob({
      jobType: "document_archive",
      actionKey: "document.archive",
      payload: {
        tenantId: "tenant_1",
        documentId: archiveDocument.id,
        idempotencyKey: "idem_archive_1"
      }
    })
  );
  if (previousMode === undefined) {
    delete process.env.PERSISTENCE_MODE;
  } else {
    process.env.PERSISTENCE_MODE = previousMode;
  }
  if (previousDb === undefined) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = previousDb;
  }
  assert.equal(result.ok, true);
  assert.ok(result.reasons?.some((reason) => reason.includes("document_archive_completed") || reason.includes("document_job_completed")));
});
