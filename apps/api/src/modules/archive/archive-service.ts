import type { ArchiveDownloadLink, ArchiveListResponse, ArchiveRecord, ArchiveSourceType, Document } from "@hallederiz/types";
import { getLatestFileSaveJobForDocument, listFileSaveJobs } from "../../ai-local-output-store";
import { listDocuments } from "../../commercial-operations/mock-store";
import { resolveDocumentDownloadLink } from "../documents/download-contract";
import type { RequestContext } from "../../shared/request-context";

const HTTPS_URL = /^https:\/\//i;

function mapDocumentTypeToSource(document: Document): ArchiveSourceType {
  switch (document.entityType) {
    case "offer":
      return "offer";
    case "order":
      return "order";
    case "payment":
      return "payment";
    default:
      return "document";
  }
}

function mapDocumentToArchiveStatus(document: Document, documentId: string): ArchiveRecord["status"] {
  if (document.downloadUrl && HTTPS_URL.test(document.downloadUrl)) {
    return "ready";
  }
  const job = getLatestFileSaveJobForDocument(documentId);
  if (job?.status === "failed") {
    return "failed";
  }
  if (job?.status === "completed") {
    return "archived";
  }
  if (job) {
    return "pending";
  }
  return document.fileStatus === "ready" ? "ready" : "pending";
}

export function mapDocumentToArchiveRecord(document: Document, tenantId: string): ArchiveRecord {
  const status = mapDocumentToArchiveStatus(document, document.id);
  const job = getLatestFileSaveJobForDocument(document.id);
  const downloadUrl =
    document.downloadUrl && HTTPS_URL.test(document.downloadUrl) ? document.downloadUrl.trim() : undefined;

  return {
    id: `archive_${document.id}`,
    tenantId,
    sourceType: mapDocumentTypeToSource(document),
    sourceId: document.entityId,
    title: document.title,
    fileName: job?.fileName ?? (document.documentNo ? `${document.documentNo}.pdf` : undefined),
    mimeType: "application/pdf",
    storageKey: downloadUrl ? `documents/${document.id}` : undefined,
    downloadUrl,
    createdAt: document.createdAt,
    archivedAt: job?.completedAt,
    status,
    customerId: document.customerId,
    documentId: document.id,
    metadata: {
      documentNo: document.documentNo,
      documentType: document.type,
      entityNo: document.entityNo
    }
  };
}

export class ArchiveService {
  constructor(private readonly context: RequestContext) {}

  isLiveReady(): boolean {
    return this.context.persistenceMode !== "postgres";
  }

  listArchive(params?: {
    page?: number;
    pageSize?: number;
    customerId?: string;
    sourceType?: ArchiveSourceType;
    status?: ArchiveRecord["status"];
  }): ArchiveListResponse {
    const page = Math.max(1, params?.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, params?.pageSize ?? 50));

    if (this.context.persistenceMode === "postgres") {
      return { items: [], total: 0, page, pageSize, liveReady: false };
    }

    let items = listDocuments()
      .filter((doc) => doc.tenantId === this.context.tenantId)
      .map((doc) => mapDocumentToArchiveRecord(doc, this.context.tenantId));

    const completedJobs = listFileSaveJobs().filter((job) => job.status === "completed" && job.tenantId === this.context.tenantId);
    for (const job of completedJobs) {
      const existing = items.find((row) => row.documentId === job.documentId);
      if (existing) {
        existing.archivedAt = job.completedAt ?? existing.archivedAt;
        if (existing.status === "pending") {
          existing.status = "archived";
        }
        existing.fileName = job.fileName ?? existing.fileName;
      }
    }

    if (params?.customerId) {
      items = items.filter((row) => row.customerId === params.customerId);
    }
    if (params?.sourceType) {
      items = items.filter((row) => row.sourceType === params.sourceType);
    }
    if (params?.status) {
      items = items.filter((row) => row.status === params.status);
    }

    const total = items.length;
    const offset = (page - 1) * pageSize;
    return {
      items: items.slice(offset, offset + pageSize),
      total,
      page,
      pageSize,
      liveReady: true
    };
  }

  getArchive(id: string): ArchiveRecord | null {
    const document = listDocuments().find(
      (doc) =>
        doc.tenantId === this.context.tenantId &&
        (`archive_${doc.id}` === id || doc.id === id || doc.entityId === id)
    );
    if (!document) {
      return null;
    }
    return mapDocumentToArchiveRecord(document, this.context.tenantId);
  }

  resolveArchiveDownloadLink(archiveId: string): { status: 404 } | { status: 202; item: ArchiveDownloadLink } | { status: 200; item: ArchiveDownloadLink } {
    const record = this.getArchive(archiveId);
    if (!record) {
      return { status: 404 };
    }

    const documentId = record.documentId ?? record.sourceId;
    if (!documentId) {
      return { status: 404 };
    }

    const documents = listDocuments();
    const document = documents.find((doc) => doc.id === documentId);
    const resolved = resolveDocumentDownloadLink(document, documentId);

    if (resolved.status === 404) {
      return { status: 404 };
    }

    if (resolved.status === 200) {
      return {
        status: 200,
        item: {
          archiveId,
          status: "ready",
          downloadUrl: resolved.item.downloadUrl,
          signedUrl: resolved.item.signedUrl,
          storageKey: resolved.item.storageKey,
          fileId: resolved.item.fileId,
          documentId,
          jobId: resolved.item.jobId,
          expiresAt: resolved.item.expiresAt,
          fileName: resolved.item.fileName,
          mimeType: resolved.item.mimeType
        }
      };
    }

    const linkStatus =
      resolved.item.status === "unavailable" ? "unavailable" : resolved.item.status === "missing" ? "missing" : "pending";

    return {
      status: 202,
      item: {
        archiveId,
        status: linkStatus,
        documentId,
        jobId: resolved.item.jobId,
        fileName: resolved.item.fileName,
        mimeType: resolved.item.mimeType,
        reason: resolved.item.reason
      }
    };
  }
}
