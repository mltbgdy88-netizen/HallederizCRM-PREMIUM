import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { createDocumentRenderHandler } from "@hallederiz/domain";
import { listDocuments } from "../commercial-operations/mock-store";
import { bootstrapWorkerDomainExecutionPort } from "../shared/worker-domain-execution-port";

test("document_render completes when foundation renderer env is configured", () => {
  const pendingDocument = listDocuments().find((doc) => !doc.downloadUrl) ?? listDocuments()[0];
  assert.ok(pendingDocument, "expected foundation document seed");
  const tempDir = mkdtempSync(path.join(tmpdir(), "hz-doc-render-"));
  const previousRenderer = process.env.DOCUMENT_RENDERER_URL;
  const previousPublic = process.env.DOCUMENT_PUBLIC_BASE_URL;
  const previousRoot = process.env.LOCAL_OUTPUT_ROOT;

  process.env.DOCUMENT_RENDERER_URL = "https://renderer.local";
  process.env.DOCUMENT_PUBLIC_BASE_URL = "https://files.local";
  process.env.LOCAL_OUTPUT_ROOT = tempDir;

  bootstrapWorkerDomainExecutionPort();
  const handler = createDocumentRenderHandler();
  const result = handler.handle({
    jobId: "job_render_1",
    tenantId: "tenant_1",
    jobType: "document_render",
    actionKey: "document.render",
    payload: {
      tenantId: "tenant_1",
      documentId: pendingDocument.id,
      idempotencyKey: "idem_render_1"
    },
    status: "pending",
    attempts: 0,
    maxAttempts: 3,
    idempotencyKey: "idem_render_1",
    availableAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  if (previousRenderer === undefined) {
    delete process.env.DOCUMENT_RENDERER_URL;
  } else {
    process.env.DOCUMENT_RENDERER_URL = previousRenderer;
  }
  if (previousPublic === undefined) {
    delete process.env.DOCUMENT_PUBLIC_BASE_URL;
  } else {
    process.env.DOCUMENT_PUBLIC_BASE_URL = previousPublic;
  }
  if (previousRoot === undefined) {
    delete process.env.LOCAL_OUTPUT_ROOT;
  } else {
    process.env.LOCAL_OUTPUT_ROOT = previousRoot;
  }
  rmSync(tempDir, { recursive: true, force: true });

  assert.equal(result.ok, true);
  assert.ok(result.reasons?.includes("document_render_completed"));
});
