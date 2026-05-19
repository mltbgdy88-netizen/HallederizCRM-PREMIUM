import type { Document, DocumentDelivery } from "@hallederiz/types";

const DOWNLOAD_URL_KEYS = ["pdfUrl", "downloadUrl", "fileUrl", "binaryUrl", "publicUrl", "url", "href"] as const;

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
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
  const preview = document.previewText?.trim();
  if (preview && isHttpUrl(preview)) {
    return preview;
  }
  return null;
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
