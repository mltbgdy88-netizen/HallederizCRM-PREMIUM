import type { Document, DocumentDelivery, DocumentDownloadLink } from "@hallederiz/types";
import {
  MSG_DOC_DOWNLOAD_NOT_READY,
  MSG_DOC_DOWNLOAD_PENDING,
  MSG_DOC_DOWNLOAD_PREPARING,
  MSG_DOC_DOWNLOAD_UNAVAILABLE
} from "../data/document-action-messages";

const DOWNLOAD_URL_KEYS = ["pdfUrl", "downloadUrl", "fileUrl", "binaryUrl", "publicUrl", "url", "href"] as const;

function isHttpUrl(value: string): boolean {
  return /^https:\/\//i.test(value.trim());
}

export function extractDownloadUrlFromRecord(record: Record<string, unknown> | null | undefined): string | null {
  if (!record) {
    return null;
  }
  for (const key of DOWNLOAD_URL_KEYS) {
    const candidate = record[key];
    if (typeof candidate === "string" && isHttpUrl(candidate)) {
      return candidate.trim();
    }
  }
  return null;
}

export function extractDownloadUrlFromDocument(document: Document | null): string | null {
  if (!document) {
    return null;
  }
  if (document.downloadUrl && isHttpUrl(document.downloadUrl)) {
    return document.downloadUrl.trim();
  }
  const preview = document.previewText?.trim();
  if (preview && isHttpUrl(preview)) {
    return preview;
  }
  return null;
}

export function extractDownloadUrlFromLink(link: DocumentDownloadLink | null | undefined): string | null {
  if (!link?.downloadUrl || !isHttpUrl(link.downloadUrl)) {
    return null;
  }
  return link.downloadUrl.trim();
}

export function resolveDocumentDownloadUserMessage(options: {
  httpStatus: number;
  link?: DocumentDownloadLink | null;
}): string {
  if (options.httpStatus === 404) {
    return MSG_DOC_DOWNLOAD_NOT_READY;
  }
  if (options.httpStatus >= 500 || options.httpStatus === 401 || options.httpStatus === 403) {
    return MSG_DOC_DOWNLOAD_UNAVAILABLE;
  }
  if (options.link?.status === "unavailable") {
    return MSG_DOC_DOWNLOAD_NOT_READY;
  }
  if (options.link?.status === "ready" && options.link.downloadUrl && isHttpUrl(options.link.downloadUrl)) {
    return "";
  }
  if (options.httpStatus === 202 || options.link?.status === "pending") {
    return MSG_DOC_DOWNLOAD_PREPARING;
  }
  return MSG_DOC_DOWNLOAD_PENDING;
}

export function hasDownloadablePdf(
  document: Document | null,
  options?: { extraUrl?: string | null }
): boolean {
  if (!document) {
    return false;
  }
  if (options?.extraUrl && isHttpUrl(options.extraUrl)) {
    return true;
  }
  return Boolean(extractDownloadUrlFromDocument(document));
}

export function findLatestDelivery(
  document: Document,
  channel: DocumentDelivery["channel"]
): DocumentDelivery | undefined {
  const matches = (document.deliveries ?? []).filter((item) => item.channel === channel);
  if (!matches.length) {
    return undefined;
  }
  return matches.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))[0];
}
