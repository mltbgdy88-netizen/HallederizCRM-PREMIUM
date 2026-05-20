import type { TenantId } from "./identifiers";

export type ArchiveRecordStatus = "ready" | "pending" | "failed" | "archived";
export type ArchiveSourceType = "document" | "offer" | "order" | "payment" | "system";

export interface ArchiveRecord {
  id: string;
  tenantId: TenantId;
  sourceType: ArchiveSourceType;
  sourceId: string;
  title: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  storageKey?: string;
  downloadUrl?: string;
  createdAt: string;
  archivedAt?: string;
  status: ArchiveRecordStatus;
  customerId?: string;
  customerName?: string;
  documentId?: string;
  metadata?: Record<string, unknown>;
}

export interface ArchiveListResponse {
  items: ArchiveRecord[];
  total: number;
  page: number;
  pageSize: number;
  liveReady: boolean;
}

export interface ArchiveDetailResponse {
  item: ArchiveRecord;
  liveReady: boolean;
}

export type ArchiveDownloadFileStatus = "ready" | "pending" | "missing" | "unavailable";

export interface ArchiveDownloadLink {
  archiveId: string;
  status: ArchiveDownloadFileStatus;
  downloadUrl?: string;
  signedUrl?: string;
  storageKey?: string;
  fileId?: string;
  documentId?: string;
  jobId?: string;
  expiresAt?: string;
  fileName?: string;
  mimeType?: string;
  reason?: string;
}
