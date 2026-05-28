import assert from "node:assert/strict";
import test from "node:test";
import type { Document } from "@hallederiz/types";
import { hasDownloadablePdf } from "../utils/document-delivery-utils";

const baseDocument: Document = {
  id: "document_1",
  tenantId: "tenant_1",
  documentNo: "DOC-1",
  type: "invoice_pdf",
  entityType: "invoice",
  entityId: "invoice_1",
  entityNo: "INV-1",
  title: "Fatura",
  previewText: "Önizleme",
  createdAt: "2026-01-01T00:00:00.000Z",
  createdBy: "user_1",
  deliveries: []
};

test("hasDownloadablePdf accepts HTTPS downloadUrl", () => {
  assert.equal(
    hasDownloadablePdf({ ...baseDocument, downloadUrl: "https://cdn.example.com/doc.pdf" }),
    true
  );
});

test("hasDownloadablePdf rejects HTTP downloadUrl", () => {
  assert.equal(
    hasDownloadablePdf({ ...baseDocument, downloadUrl: "http://cdn.example.com/doc.pdf" }),
    false
  );
});

test("hasDownloadablePdf rejects relative paths", () => {
  assert.equal(hasDownloadablePdf({ ...baseDocument, downloadUrl: "/files/doc.pdf" }), false);
});

test("hasDownloadablePdf rejects empty url", () => {
  assert.equal(hasDownloadablePdf({ ...baseDocument, downloadUrl: "" }), false);
});

test("hasDownloadablePdf rejects pending without verified url", () => {
  assert.equal(hasDownloadablePdf(baseDocument), false);
});

