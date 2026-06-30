import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { RequestContext } from "../../shared/request-context";
import type { WorkerDomainExecutionResult } from "@hallederiz/domain";
import { getDocument, setDocumentFileReady } from "../../commercial-operations/mock-store";
import { getLatestFileSaveJobForDocument, markFileSaveJobStatus, queueDocumentSave } from "../../ai-local-output-store";

const HTTPS_URL = /^https:\/\//i;

const MINIMAL_PDF = Buffer.from(
  `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj
xref
0 4
trailer<</Root 1 0 R>>
startxref
0
%%EOF`,
  "utf8"
);

function resolvePublicBaseUrl(): string | null {
  const candidate =
    process.env.DOCUMENT_PUBLIC_BASE_URL?.trim() ||
    process.env.DOCUMENT_RENDERER_URL?.trim() ||
    process.env.PUBLIC_API_BASE_URL?.trim();
  if (!candidate || !HTTPS_URL.test(candidate)) {
    return null;
  }
  return candidate.replace(/\/$/, "");
}

function resolveLocalOutputRoot(): string | null {
  const root = process.env.LOCAL_OUTPUT_ROOT?.trim();
  return root || null;
}

export function isDocumentRendererConfigured(): boolean {
  return Boolean(resolvePublicBaseUrl() && (resolveLocalOutputRoot() || process.env.DOCUMENT_RENDERER_URL?.trim()));
}

function buildPublicDownloadUrl(tenantId: string, documentId: string, fileName: string): string | null {
  const base = resolvePublicBaseUrl();
  if (!base) {
    return null;
  }
  return `${base}/files/${encodeURIComponent(tenantId)}/documents/${encodeURIComponent(documentId)}/${encodeURIComponent(fileName)}`;
}

function writeFoundationPdfFile(
  tenantId: string,
  documentId: string,
  fileName: string
): { storagePath: string; downloadUrl: string } | null {
  const outputRoot = resolveLocalOutputRoot();
  const downloadUrl = buildPublicDownloadUrl(tenantId, documentId, fileName);
  if (!outputRoot || !downloadUrl) {
    return null;
  }

  const targetDir = path.join(outputRoot, tenantId, "documents", documentId);
  const targetPath = path.join(targetDir, fileName);
  mkdirSync(targetDir, { recursive: true });
  writeFileSync(targetPath, MINIMAL_PDF);
  return { storagePath: targetPath, downloadUrl };
}

export function executeDocumentRenderJob(
  context: RequestContext,
  documentId: string
): WorkerDomainExecutionResult {
  if (!isDocumentRendererConfigured()) {
    return { status: "deferred", mutation_executed: false, reasons: ["renderer_not_configured"] };
  }

  const document = getDocument(documentId);
  if (!document || document.tenantId !== context.tenantId) {
    return { status: "failed", mutation_executed: false, reasons: ["document_not_found"] };
  }

  const fileName = document.documentNo ? `${document.documentNo}.pdf` : `${documentId}.pdf`;
  const written = writeFoundationPdfFile(context.tenantId, documentId, fileName);
  if (!written) {
    return { status: "deferred", mutation_executed: false, reasons: ["renderer_adapter_not_implemented"] };
  }

  const updated = setDocumentFileReady(documentId, { downloadUrl: written.downloadUrl, fileStatus: "ready" });
  if (!updated) {
    return { status: "failed", mutation_executed: false, reasons: ["document_update_failed"] };
  }

  return {
    status: "completed",
    mutation_executed: true,
    entityType: "document",
    entityId: documentId,
    reasons: ["document_render_completed", `download_url:${written.downloadUrl}`]
  };
}

export function executeDocumentArchiveJob(
  context: RequestContext,
  documentId: string
): WorkerDomainExecutionResult {
  const document = getDocument(documentId);
  if (!document || document.tenantId !== context.tenantId) {
    return { status: "failed", mutation_executed: false, reasons: ["document_not_found"] };
  }

  let job = getLatestFileSaveJobForDocument(documentId);
  if (!job) {
    job = queueDocumentSave(documentId);
  }

  const downloadUrl =
    document.downloadUrl && HTTPS_URL.test(document.downloadUrl)
      ? document.downloadUrl
      : buildPublicDownloadUrl(context.tenantId, documentId, job.fileName ?? `${documentId}.pdf`);

  if (downloadUrl) {
    setDocumentFileReady(documentId, { downloadUrl, fileStatus: "ready" });
  }

  markFileSaveJobStatus(job.id, "completed");

  return {
    status: "completed",
    mutation_executed: true,
    entityType: "document",
    entityId: documentId,
    reasons: ["document_archive_completed", `archive_job:${job.id}`]
  };
}
