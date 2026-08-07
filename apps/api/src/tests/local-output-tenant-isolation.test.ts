import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import {
  getLatestFileSaveJobForDocument,
  getLocalAgentStatus,
  listFileSaveJobs,
  listPrintJobs,
  markFileSaveJobStatus,
  markPrintJobStatus,
  queueDocumentPrint,
  queueDocumentSave,
  reportLocalAgentStatus
} from "../ai-local-output-store";
import { registerAiLocalOutputRoutes } from "../ai-local-output-routes";
import { createDatabaseSession } from "../shared/session-store";

async function buildServer() {
  const server = Fastify();
  await registerAiLocalOutputRoutes(server);
  return server;
}

function createTenantSession(tenantId: string) {
  const tenantSlug = `slug_${tenantId}`;
  const email = `admin_${tenantId}@example.test`;
  return createDatabaseSession(
    { tenantSlug, email, password: "test-only" },
    {
      status: "success",
      tenantId,
      tenantSlug,
      tenantName: `Tenant ${tenantId}`,
      userId: `user_${tenantId}`,
      email,
      fullName: "Test Admin",
      role: "admin"
    }
  );
}

function authHeaders(accessToken: string, tenantId: string) {
  return {
    authorization: `Bearer ${accessToken}`,
    "x-session-token": accessToken,
    "x-tenant-id": tenantId
  };
}

test("local-output store fails closed when tenantId is missing or invalid", () => {
  const unsafeListPrintJobs = listPrintJobs as (tenantId?: string) => unknown[];
  const unsafeMarkPrintJobStatus = markPrintJobStatus as (
    tenantId: string | undefined,
    id: string,
    status: "printing"
  ) => unknown;

  assert.throws(() => unsafeListPrintJobs(undefined), /tenant_id_required/);
  assert.throws(() => listFileSaveJobs("   "), /tenant_id_required/);
  assert.throws(() => queueDocumentSave("tenant with spaces", "document_invalid"), /tenant_id_required/);
  assert.throws(() => getLocalAgentStatus(" tenant_invalid"), /tenant_id_required/);
  assert.throws(
    () => reportLocalAgentStatus("", { status: "online" }),
    /tenant_id_required/
  );
  assert.throws(
    () => unsafeMarkPrintJobStatus(undefined, "job_unknown", "printing"),
    /tenant_id_required/
  );
});

test("two-tenant job lists and file content remain isolated", async () => {
  const tenantA = "tenant_list_a";
  const tenantB = "tenant_list_b";
  const sessionA = createTenantSession(tenantA);
  const sessionB = createTenantSession(tenantB);
  const printA = queueDocumentPrint(tenantA, "document_print_a");
  const printB = queueDocumentPrint(tenantB, "document_print_b");
  const fileA = queueDocumentSave(tenantA, "document_file_a");
  const fileB = queueDocumentSave(tenantB, "document_file_b");
  fileB.contentBase64 = "CROSS_TENANT_CONTENT_MARKER";

  const server = await buildServer();
  try {
    const printResponseA = await server.inject({
      method: "GET",
      url: "/print-jobs",
      headers: authHeaders(sessionA.accessToken, tenantA)
    });
    const printResponseB = await server.inject({
      method: "GET",
      url: "/print-jobs",
      headers: authHeaders(sessionB.accessToken, tenantB)
    });
    assert.equal(printResponseA.statusCode, 200);
    assert.equal(printResponseB.statusCode, 200);
    assert.equal(printResponseA.json().items.some((job: { id: string }) => job.id === printA.id), true);
    assert.equal(printResponseA.json().items.some((job: { id: string }) => job.id === printB.id), false);
    assert.equal(printResponseB.json().items.some((job: { id: string }) => job.id === printB.id), true);
    assert.equal(printResponseB.json().items.some((job: { id: string }) => job.id === printA.id), false);

    const fileResponseA = await server.inject({
      method: "GET",
      url: "/file-save-jobs",
      headers: authHeaders(sessionA.accessToken, tenantA)
    });
    const fileResponseB = await server.inject({
      method: "GET",
      url: "/file-save-jobs",
      headers: authHeaders(sessionB.accessToken, tenantB)
    });
    assert.equal(fileResponseA.statusCode, 200);
    assert.equal(fileResponseB.statusCode, 200);
    assert.equal(fileResponseA.json().items.some((job: { id: string }) => job.id === fileA.id), true);
    assert.equal(fileResponseA.json().items.some((job: { id: string }) => job.id === fileB.id), false);
    assert.equal(fileResponseB.json().items.some((job: { id: string }) => job.id === fileB.id), true);
    assert.equal(fileResponseA.body.includes("CROSS_TENANT_CONTENT_MARKER"), false);
    assert.equal(fileResponseB.body.includes("CROSS_TENANT_CONTENT_MARKER"), true);
    assert.equal(getLatestFileSaveJobForDocument(tenantA, "document_file_b"), undefined);
  } finally {
    await server.close();
  }
});

test("cross-tenant job transitions return 404 and agent status stays tenant-bound", async () => {
  const tenantA = "tenant_transition_a";
  const tenantB = "tenant_transition_b";
  const sessionA = createTenantSession(tenantA);
  const sessionB = createTenantSession(tenantB);
  const printStartB = queueDocumentPrint(tenantB, "document_print_start_b");
  const printCompleteB = queueDocumentPrint(tenantB, "document_print_complete_b");
  const printFailB = queueDocumentPrint(tenantB, "document_print_fail_b");
  const fileStartB = queueDocumentSave(tenantB, "document_file_start_b");
  const fileCompleteB = queueDocumentSave(tenantB, "document_file_complete_b");
  const fileFailB = queueDocumentSave(tenantB, "document_file_fail_b");
  const printJobsB = [printStartB, printCompleteB, printFailB];
  const fileJobsB = [fileStartB, fileCompleteB, fileFailB];
  const server = await buildServer();

  try {
    const deniedTransitions = [
      `/print-jobs/${printStartB.id}/start`,
      `/print-jobs/${printCompleteB.id}/complete`,
      `/print-jobs/${printFailB.id}/fail`,
      `/file-save-jobs/${fileStartB.id}/start`,
      `/file-save-jobs/${fileCompleteB.id}/complete`,
      `/file-save-jobs/${fileFailB.id}/fail`
    ];
    for (const url of deniedTransitions) {
      const response = await server.inject({
        method: "POST",
        url,
        headers: authHeaders(sessionA.accessToken, tenantA),
        payload: url.endsWith("/fail") ? { errorMessage: "test failure" } : undefined
      });
      assert.equal(response.statusCode, 404);
    }
    assert.equal(printJobsB.every((job) => job.status === "queued"), true);
    assert.equal(fileJobsB.every((job) => job.status === "queued"), true);

    const ownPrint = queueDocumentPrint(tenantA, "document_print_a");
    const ownStart = await server.inject({
      method: "POST",
      url: `/print-jobs/${ownPrint.id}/start`,
      headers: authHeaders(sessionA.accessToken, tenantA)
    });
    const ownComplete = await server.inject({
      method: "POST",
      url: `/print-jobs/${ownPrint.id}/complete`,
      headers: authHeaders(sessionA.accessToken, tenantA)
    });
    assert.equal(ownStart.statusCode, 200);
    assert.equal(ownComplete.statusCode, 200);
    assert.equal(ownComplete.json().item.status, "completed");

    const ownFile = queueDocumentSave(tenantA, "document_file_a");
    const ownFileStart = await server.inject({
      method: "POST",
      url: `/file-save-jobs/${ownFile.id}/start`,
      headers: authHeaders(sessionA.accessToken, tenantA)
    });
    const ownFileComplete = await server.inject({
      method: "POST",
      url: `/file-save-jobs/${ownFile.id}/complete`,
      headers: authHeaders(sessionA.accessToken, tenantA)
    });
    assert.equal(ownFileStart.statusCode, 200);
    assert.equal(ownFileComplete.statusCode, 200);
    assert.equal(ownFileComplete.json().item.status, "completed");

    const statusWriteA = await server.inject({
      method: "POST",
      url: "/local-agent/status",
      headers: authHeaders(sessionA.accessToken, tenantA),
      payload: { status: "online", message: "tenant A agent" }
    });
    const statusReadB = await server.inject({
      method: "GET",
      url: "/local-agent/status",
      headers: authHeaders(sessionB.accessToken, tenantB)
    });
    assert.equal(statusWriteA.statusCode, 201);
    assert.equal(statusReadB.statusCode, 200);
    assert.notEqual(statusReadB.json().item.status, "online");

    const statusWriteB = await server.inject({
      method: "POST",
      url: "/local-agent/status",
      headers: authHeaders(sessionB.accessToken, tenantB),
      payload: { status: "error", message: "tenant B agent" }
    });
    assert.equal(statusWriteB.statusCode, 201);
    assert.equal(getLocalAgentStatus(tenantA).status, "online");
    assert.equal(getLocalAgentStatus(tenantB).status, "error");
  } finally {
    await server.close();
  }
});
