import type { Document, DocumentDownloadLink } from "@hallederiz/types";
import { getLatestFileSaveJobForDocument } from "../../ai-local-output-store";

/** Production-ready download URLs must be HTTPS. */
const HTTPS_URL = /^https:\/\//i;

function pickHttpsUrl(document: Document): string | null {
  if (document.downloadUrl && HTTPS_URL.test(document.downloadUrl)) {
    return document.downloadUrl.trim();
  }
  const preview = document.previewText?.trim();
  if (preview && HTTPS_URL.test(preview)) {
    return preview;
  }
  return null;
}

function buildFileMetadata(document: Document, downloadUrl: string | null): Partial<DocumentDownloadLink> {
  return {
    fileName: document.documentNo ? `${document.documentNo}.pdf` : undefined,
    mimeType: "application/pdf",
    generatedAt: document.createdAt,
    storageKey: downloadUrl ? `documents/${document.id}` : undefined,
    fileId: downloadUrl ? document.id : undefined
  };
}

export function resolveDocumentDownloadLink(
  document: Document | null | undefined,
  documentId: string
): { status: 404 } | { status: 202; item: DocumentDownloadLink } | { status: 200; item: DocumentDownloadLink } {
  if (!document) {
    return { status: 404 };
  }

  const downloadUrl = pickHttpsUrl(document);
  if (downloadUrl) {
    return {
      status: 200,
      item: {
        documentId,
        status: "ready",
        downloadUrl,
        fileUrl: downloadUrl,
        ...buildFileMetadata(document, downloadUrl)
      }
    };
  }

  const job = getLatestFileSaveJobForDocument(documentId);
  const base: DocumentDownloadLink = {
    documentId,
    status: "pending",
    ...(job ? { jobId: job.id, fileName: job.fileName } : {}),
    ...buildFileMetadata(document, null)
  };

  if (job?.status === "failed") {
    return {
      status: 202,
      item: {
        ...base,
        status: "unavailable",
        jobId: job.id,
        reason: "file_generation_failed"
      }
    };
  }

  if (document.fileStatus === "unavailable") {
    return {
      status: 202,
      item: { ...base, status: "unavailable", reason: "file_not_available" }
    };
  }

  return { status: 202, item: base };
}
