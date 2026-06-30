import type { Approval } from "@hallederiz/types";
import { dataSourceConfig } from "../../../lib/data-source";
import { getOperationsEngineData } from "../queries/operations-engine-mock-data";

const STORAGE_KEY = "hz_dashboard_dismissed_approval_alerts";

function readDismissed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeDismissed(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export function dismissApprovalAlertIds(ids: string[]): void {
  if (ids.length === 0) return;
  const next = readDismissed();
  for (const id of ids) next.add(id);
  writeDismissed(next);
}

export async function fetchPendingApprovals(): Promise<Approval[]> {
  if (dataSourceConfig.useDemoData) {
    const engine = await getOperationsEngineData();
    return engine.approvals.filter((approval) => approval.status === "pending");
  }

  try {
    const { sdk } = await import("../../../lib/data-source");
    const response = await sdk.approvals.list();
    return (response.items ?? []).filter((approval) => approval.status === "pending");
  } catch {
    return [];
  }
}

export async function resolveActiveApprovalAlert(): Promise<Approval | null> {
  const pending = await fetchPendingApprovals();
  if (pending.length === 0) return null;

  const dismissed = readDismissed();
  const sorted = [...pending].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return sorted.find((approval) => !dismissed.has(approval.id)) ?? null;
}

/** Menüden veya başka yoldan Onaylar sayfasına gidildiğinde uyarı modunu kapatır. */
export async function acknowledgeAllPendingApprovalAlerts(): Promise<void> {
  const pending = await fetchPendingApprovals();
  dismissApprovalAlertIds(pending.map((approval) => approval.id));
}
