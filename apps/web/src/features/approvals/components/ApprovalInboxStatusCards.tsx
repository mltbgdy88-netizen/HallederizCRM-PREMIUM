"use client";

import type { ReactNode } from "react";
import type { WorkerHealthResponse } from "../types";
import { summarizeWorkerHealth } from "../utils/inbox-helpers";

function workerCardLabel(health: WorkerHealthResponse | null | undefined): string {
  if (!health) return "Bilinmiyor";
  if (!health.ok) return "Kullanılamıyor";
  const mode = health.health?.mode?.toLowerCase() ?? "";
  if (mode.includes("foundation") || mode.includes("dry")) return "Foundation";
  if (mode.includes("live") || mode.includes("prod")) return "Sağlıklı";
  return "Sağlıklı";
}

function outboxCardLabel(health: WorkerHealthResponse | null | undefined): string {
  const s = health?.health?.summary;
  if (!s) return "Özet yok";
  if (s.deadLettered > 0) return "DLQ";
  if (s.failed > 0) return "Kuyruk · hata";
  if ((s.processed ?? 0) > 0 || (s.completed ?? 0) > 0) return "Kuyruk";
  return "Sağlıklı";
}

export function ApprovalInboxStatusCards({
  workerHealth,
  workerSafety,
  autoRefreshLabel,
  sandboxSeedSlot
}: {
  workerHealth: WorkerHealthResponse | null;
  workerSafety: WorkerHealthResponse | null;
  autoRefreshLabel: string;
  sandboxSeedSlot?: ReactNode;
}) {
  return (
    <div className="hz-approvals-inbox-status-cards" role="group" aria-label="Operasyon mini durum">
      <div className="hz-approvals-inbox-status-card">
        <p className="hz-approvals-inbox-status-card-k">Worker</p>
        <p className="hz-approvals-inbox-status-card-v">{workerCardLabel(workerHealth)}</p>
        <p className="hz-approvals-inbox-status-card-sub hz-approvals-inbox-muted">{summarizeWorkerHealth(workerHealth)}</p>
      </div>
      <div className="hz-approvals-inbox-status-card">
        <p className="hz-approvals-inbox-status-card-k">Outbox</p>
        <p className="hz-approvals-inbox-status-card-v">{outboxCardLabel(workerSafety)}</p>
        <p className="hz-approvals-inbox-status-card-sub hz-approvals-inbox-muted">{summarizeWorkerHealth(workerSafety)}</p>
      </div>
      <div className="hz-approvals-inbox-status-card">
        <p className="hz-approvals-inbox-status-card-k">Yenileme</p>
        <p className="hz-approvals-inbox-status-card-v">{autoRefreshLabel}</p>
        <p className="hz-approvals-inbox-status-card-sub hz-approvals-inbox-muted">Manuel yenileme her zaman kullanılabilir.</p>
      </div>
      {sandboxSeedSlot ? <div className="hz-approvals-inbox-status-card hz-approvals-inbox-status-card--seed">{sandboxSeedSlot}</div> : null}
    </div>
  );
}
