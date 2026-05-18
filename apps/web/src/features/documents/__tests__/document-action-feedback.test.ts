import assert from "node:assert/strict";
import test from "node:test";
import { ApiError } from "@hallederiz/sdk";
import {
  MSG_DOC_DOWNLOAD_NOT_LIVE,
  MSG_DOC_PDF_NOT_LIVE,
  MSG_DOC_PREVIEW_ONLY,
  MSG_DOC_QUEUE_NOT_LIVE
} from "../data/document-action-messages";
import {
  hasDownloadablePdf,
  mapDocumentActionError,
  resolveDemoActionToasts,
  sanitizeDocumentUserText
} from "../utils/document-action-feedback";

test("sanitizeDocumentUserText replaces false success wording", () => {
  assert.equal(sanitizeDocumentUserText("PDF olusturuldu"), "PDF hazırlandı");
  assert.equal(sanitizeDocumentUserText("Belge gonderildi"), "Belge iletilecek");
});

test("mapDocumentActionError hides technical terms", () => {
  const message = mapDocumentActionError(new ApiError("dispatcher failed in outbox worker", 503));
  assert.equal(message, MSG_DOC_QUEUE_NOT_LIVE);
});

test("resolveDemoActionToasts never claims PDF created", () => {
  const toasts = resolveDemoActionToasts("regenerate");
  assert.deepEqual(toasts, [MSG_DOC_PDF_NOT_LIVE, MSG_DOC_PREVIEW_ONLY]);
});

test("hasDownloadablePdf is false without verified binary", () => {
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
      previewText: "preview",
      createdAt: "2026-01-01T00:00:00.000Z",
      createdBy: "u1",
      deliveries: [{ id: "d1", tenantId: "t1", documentId: "doc_1", channel: "download", status: "delivered", requestedAt: "2026-01-01T00:00:00.000Z", sentAt: "2026-01-01T00:00:00.000Z" }]
    }),
    false
  );
});

test("resolveDemoActionToasts for download", () => {
  const toasts = resolveDemoActionToasts("download");
  assert.equal(toasts[0], MSG_DOC_DOWNLOAD_NOT_LIVE);
});
