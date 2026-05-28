import assert from "node:assert/strict";
import test from "node:test";
import { DocumentGenerationService } from "../modules/documents/service";
import { IntegrationsService } from "../modules/integrations/service";
import {
  getLocalAgentStatus,
  markFileSaveJobStatus,
  markPrintJobStatus,
  queueDocumentPrint,
  queueDocumentSave,
  reportLocalAgentStatus
} from "../ai-local-output-store";
import type { RequestContext } from "../shared/request-context";

const context: RequestContext = {
  tenantId: "tenant_1",
  userId: "user_admin",
  persistenceMode: "demo",
  isAuthenticated: true,
  permissions: ["*"]
};

test("document generation service: render + regenerate", async () => {
  const service = new DocumentGenerationService(context);
  const rendered = service.render({
    type: "invoice_pdf",
    entityType: "invoice",
    entityId: "invoice_1",
    entityNo: "INV-1201",
    customerId: "customer_1"
  });

  assert.equal(rendered.type, "invoice_pdf");
  assert.match(rendered.previewText, /INV-1201/);

  const regenerated = service.regenerate(rendered.id);
  assert.ok(regenerated);
  assert.equal(regenerated?.entityNo, "INV-1201");
});

test("integrations service: erp sync includes preview fields", async () => {
  const service = new IntegrationsService(context);
  const sync = await service.syncErpConnection("erp_conn_1");
  assert.ok(sync);
  assert.ok(sync?.preview.fields.length);
});

test("local output lifecycle: queue + status update + local-agent status", () => {
  const queuedSave = queueDocumentSave("document_1");
  const queuedPrint = queueDocumentPrint("document_1");

  const startedSave = markFileSaveJobStatus(queuedSave.id, "saving");
  const completedPrint = markPrintJobStatus(queuedPrint.id, "completed");
  assert.equal(startedSave?.status, "saving");
  assert.equal(completedPrint?.status, "completed");

  const reported = reportLocalAgentStatus({ status: "online", message: "test cycle ok" });
  assert.equal(reported.status, "online");
  assert.equal(getLocalAgentStatus().status, "online");
});
