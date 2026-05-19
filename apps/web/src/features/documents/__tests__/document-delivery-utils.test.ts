import assert from "node:assert/strict";
import test from "node:test";
import {
  MSG_DOC_DOWNLOAD_NOT_READY,
  MSG_DOC_DOWNLOAD_PREPARING
} from "../data/document-action-messages";
import {
  extractDownloadUrlFromDocument,
  hasDownloadablePdf,
  resolveDocumentDownloadUserMessage
} from "../utils/document-delivery-utils";

test("hasDownloadablePdf is false without HTTPS URL", () => {
  assert.equal(
    hasDownloadablePdf({
      id: "doc_1",
      tenantId: "t1",
      documentNo: "DOC-1",
      type: "offer_pdf",
      entityType: "offer",
      entityId: "o1",
      entityNo: "TKL-1",
      title: "Teklif",
      previewText: "Önizleme metni",
      createdAt: "2026-01-01T00:00:00.000Z",
      createdBy: "u1",
      deliveries: []
    }),
    false
  );
});

test("hasDownloadablePdf is true with document.downloadUrl", () => {
  assert.equal(
    hasDownloadablePdf({
      id: "doc_1",
      tenantId: "t1",
      documentNo: "DOC-1",
      type: "offer_pdf",
      entityType: "offer",
      entityId: "o1",
      entityNo: "TKL-1",
      title: "Teklif",
      previewText: "Önizleme",
      downloadUrl: "https://cdn.example.com/doc.pdf",
      createdAt: "2026-01-01T00:00:00.000Z",
      createdBy: "u1",
      deliveries: []
    }),
    true
  );
});

test("extractDownloadUrlFromDocument reads HTTPS preview", () => {
  const url = extractDownloadUrlFromDocument({
    id: "doc_1",
    tenantId: "t1",
    documentNo: "DOC-1",
    type: "offer_pdf",
    entityType: "offer",
    entityId: "o1",
    entityNo: "TKL-1",
    title: "Teklif",
    previewText: "https://cdn.example.com/preview.pdf",
    createdAt: "2026-01-01T00:00:00.000Z",
    createdBy: "u1",
    deliveries: []
  });
  assert.equal(url, "https://cdn.example.com/preview.pdf");
});

test("resolveDocumentDownloadUserMessage maps 202 to preparing copy", () => {
  assert.equal(
    resolveDocumentDownloadUserMessage({ httpStatus: 202, link: { documentId: "doc_1", status: "pending" } }),
    MSG_DOC_DOWNLOAD_PREPARING
  );
});

test("resolveDocumentDownloadUserMessage maps 404 to not ready copy", () => {
  assert.equal(resolveDocumentDownloadUserMessage({ httpStatus: 404 }), MSG_DOC_DOWNLOAD_NOT_READY);
});
