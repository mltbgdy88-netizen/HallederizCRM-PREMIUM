import type { Document, DocumentDownloadLink } from "@hallederiz/types";
import { getLatestFileSaveJobForDocument } from "../../ai-local-output-store";

const HTTP_URL = /^https?:\/\//i;

function pickHttpUrl(document: Document): string | null {
  if (document.downloadUrl && HTTP_URL.test(document.downloadUrl)) {
    return document.downloadUrl.trim();
  }
  const preview = document.previewText?.trim();
  if (preview && HTTP_URL.test(preview)) {
    return preview;
  }
  return null;
}

export function resolveDocumentDownloadLink(
  document: Document | null | undefined,
  documentId: string
): { status: 404 } | { status: 202; item: DocumentDownloadLink } | { status: 200; item: DocumentDownloadLink } {
  if (!document) {
    return { status: 404 };
  }

  const downloadUrl = pickHttpUrl(document);
  if (downloadUrl) {
    return {
      status: 200,
      item: {
        documentId,
        status: "ready",
        downloadUrl
      }
    };
  }

  const job = getLatestFileSaveJobForDocument(documentId);
  const base: DocumentDownloadLink = {
    documentId,
    status: "pending",
    ...(job ? { jobId: job.id } : {})
  };

  if (job?.status === "failed") {
    return {
      status: 202,
      item: { ...base, status: "unavailable", jobId: job.id }
    };
  }

  return { status: 202, item: base };
}
