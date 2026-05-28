import type { FileSaveJob, PrintJob } from "@hallederiz/types";
import { loadSettings } from "../config";

export interface LocalQueueSnapshot {
  printJobs: PrintJob[];
  fileSaveJobs: FileSaveJob[];
}

function buildHeaders() {
  const settings = loadSettings();
  return {
    "content-type": "application/json",
    "x-tenant-id": settings.tenantId,
    "x-user-id": settings.userId,
    ...(settings.sessionToken ? { "x-session-token": settings.sessionToken, authorization: `Bearer ${settings.sessionToken}` } : {})
  };
}

async function apiGet<T>(path: string): Promise<T> {
  const settings = loadSettings();
  const response = await fetch(`${settings.apiBaseUrl}${path}`, {
    method: "GET",
    headers: buildHeaders(),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Local agent GET failed: ${response.status} ${path}`);
  }

  return (await response.json()) as T;
}

async function apiPost(path: string, body?: unknown): Promise<void> {
  const settings = loadSettings();
  const response = await fetch(`${settings.apiBaseUrl}${path}`, {
    method: "POST",
    headers: buildHeaders(),
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Local agent POST failed: ${response.status} ${path}`);
  }
}

export async function pollQueue(): Promise<LocalQueueSnapshot> {
  const [printResponse, fileResponse] = await Promise.all([
    apiGet<{ items: PrintJob[] }>("/print-jobs"),
    apiGet<{ items: FileSaveJob[] }>("/file-save-jobs")
  ]);

  return {
    printJobs: printResponse.items.filter((job) => job.status === "queued"),
    fileSaveJobs: fileResponse.items.filter((job) => job.status === "queued")
  };
}

export async function markPrintJobStarted(jobId: string) {
  await apiPost(`/print-jobs/${jobId}/start`);
}

export async function markPrintJobCompleted(jobId: string, errorMessage?: string) {
  if (errorMessage) {
    await apiPost(`/print-jobs/${jobId}/fail`, { errorMessage });
    return;
  }
  await apiPost(`/print-jobs/${jobId}/complete`);
}

export async function markFileSaveJobStarted(jobId: string) {
  await apiPost(`/file-save-jobs/${jobId}/start`);
}

export async function markFileSaveJobCompleted(jobId: string, errorMessage?: string) {
  if (errorMessage) {
    await apiPost(`/file-save-jobs/${jobId}/fail`, { errorMessage });
    return;
  }
  await apiPost(`/file-save-jobs/${jobId}/complete`);
}

export async function acknowledgeJob(jobId: string) {
  return { jobId, acknowledgedAt: new Date().toISOString() };
}
