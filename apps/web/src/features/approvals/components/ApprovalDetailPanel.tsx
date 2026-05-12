"use client";

import { useState } from "react";
import type { ApprovalInboxItem } from "../types";
import type { LastApprovalActionSummary } from "../utils/operator-smoke";
import { ApprovalActionBar } from "./ApprovalActionBar";
import { ApprovalOutboxStatusCard } from "./ApprovalOutboxStatusCard";
import { ApprovalRiskSummary } from "./ApprovalRiskSummary";
import { ApprovalStatusBadge } from "./ApprovalStatusBadge";
import { ApprovalTimelinePreview } from "./ApprovalTimelinePreview";
import { EmptyState } from "./ApprovalInboxStates";
import { summarizeGateDecision } from "../utils/inbox-helpers";

function formatDate(value?: string): string {
  if (!value) return "-";
  return new Date(value).toLocaleString("tr-TR");
}

export function ApprovalDetailPanel({
  item,
  busy,
  lastApprovalSummary,
  onApprove,
  onReject
}: {
  item: ApprovalInboxItem | null;
  busy: boolean;
  /** Son basarili / idempotent onay API yaniti ozeti */
  lastApprovalSummary?: LastApprovalActionSummary | null;
  onApprove: () => void;
  onReject: (reason: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!item) {
    return (
      <aside className="hz-approvals-inbox-detail">
        <EmptyState title="Onay secin" description="Listeden bir kayit secerek detay, risk ve aksiyonlari goruntuleyin." />
      </aside>
    );
  }

  const payloadPreview = JSON.stringify(item.payload ?? {}, null, 2);
  const gateReasons = item.bridgeReasons ?? [];

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(item.approvalRequestId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <aside className="hz-approvals-inbox-detail" aria-labelledby="approval-detail-title">
      <header className="hz-approvals-inbox-detail-head">
        <p className="hz-approvals-inbox-eyebrow">Approval request</p>
        <div className="hz-approvals-inbox-detail-id-row">
          <h2 id="approval-detail-title">{item.approvalRequestId}</h2>
          <button type="button" className="hz-approvals-inbox-copy" onClick={() => void copyId()}>
            {copied ? "Kopyalandi" : "Kopyala"}
          </button>
        </div>
        <ApprovalStatusBadge status={item.status} />
      </header>

      <section className="hz-approvals-inbox-card">
        <h3 className="hz-approvals-inbox-card-title">Ozet</h3>
        <dl className="hz-approvals-inbox-meta hz-approvals-inbox-meta--grid">
          <div>
            <dt>Action key</dt>
            <dd>{item.actionKey}</dd>
          </div>
          <div>
            <dt>Actor</dt>
            <dd>{item.actorId}</dd>
          </div>
          <div>
            <dt>Talep zamani</dt>
            <dd>{formatDate(item.requestedAt)}</dd>
          </div>
          <div>
            <dt>Olusturma</dt>
            <dd>{formatDate(item.createdAt)}</dd>
          </div>
          <div>
            <dt>Onaylayan</dt>
            <dd>{item.approvedBy ?? "-"}</dd>
          </div>
          <div>
            <dt>Reddeden</dt>
            <dd>{item.rejectedBy ?? "-"}</dd>
          </div>
          <div>
            <dt>Idempotency</dt>
            <dd>{item.idempotencyKey}</dd>
          </div>
          <div>
            <dt>Red nedeni</dt>
            <dd>{item.rejectReason ?? "-"}</dd>
          </div>
          <div>
            <dt>Tenant</dt>
            <dd>{item.tenantId}</dd>
          </div>
        </dl>
        <details className="hz-approvals-inbox-payload-details">
          <summary>Payload ozeti</summary>
          <pre className="hz-approvals-inbox-payload">{payloadPreview}</pre>
        </details>
      </section>

      <section className="hz-approvals-inbox-card">
        <h3 className="hz-approvals-inbox-card-title">Runtime / bridge</h3>
        <dl className="hz-approvals-inbox-meta hz-approvals-inbox-meta--grid">
          <div>
            <dt>Execution id</dt>
            <dd>{item.executionId ?? "-"}</dd>
          </div>
          <div>
            <dt>Outbox job</dt>
            <dd>{item.outboxJobId ?? "-"}</dd>
          </div>
          <div>
            <dt>Bridge transaction</dt>
            <dd>{item.bridgeTransactionMode ?? "-"}</dd>
          </div>
          <div>
            <dt>Bridge persistence</dt>
            <dd>{item.bridgePersistenceMode ?? "-"}</dd>
          </div>
          <div>
            <dt>Audit / timeline writeback</dt>
            <dd>
              {item.auditTimelineWritebackQueued === true
                ? "Kuyruklandi veya yanitta true"
                : item.auditTimelineWritebackQueued === false
                  ? "Yanitta false"
                  : item.auditRequired
                    ? "Gerekli (detay alani bos)"
                    : "Hayir"}
            </dd>
          </div>
          <div>
            <dt>Worker onerisi</dt>
            <dd>{item.workerProcessingRecommended ? "Islenmesi onerilir" : "Beklemede / yok"}</dd>
          </div>
        </dl>
        <p className="hz-approvals-inbox-muted">Gate ozeti: {summarizeGateDecision(item.gateDecision)}</p>
      </section>

      {lastApprovalSummary ? (
        <section className="hz-approvals-inbox-card hz-approvals-inbox-card--last-action" aria-label="Son islem sonucu">
          <h3 className="hz-approvals-inbox-card-title">Son islem sonucu (onay API)</h3>
          <p className="hz-approvals-inbox-muted">
            {lastApprovalSummary.duplicate
              ? "Idempotent yanit: kayit zaten islenmis; yeni execution gonderilmedi."
              : "Onay API basarili dondu; asagidaki alanlar son yanittan."}
          </p>
          <dl className="hz-approvals-inbox-meta hz-approvals-inbox-meta--grid">
            <div>
              <dt>executionId</dt>
              <dd>{lastApprovalSummary.executionId ?? "-"}</dd>
            </div>
            <div>
              <dt>outboxJobId</dt>
              <dd>{lastApprovalSummary.outboxJobId ?? "-"}</dd>
            </div>
            <div>
              <dt>Bridge</dt>
              <dd className="hz-approvals-inbox-mono-wrap">{lastApprovalSummary.bridgeLine}</dd>
            </div>
            <div>
              <dt>auditTimelineWritebackQueued</dt>
              <dd>
                {lastApprovalSummary.auditTimelineWritebackQueued === true
                  ? "true"
                  : lastApprovalSummary.auditTimelineWritebackQueued === false
                    ? "false"
                    : "-"}
              </dd>
            </div>
            <div>
              <dt>gateDecision</dt>
              <dd className="hz-approvals-inbox-mono-wrap">{lastApprovalSummary.gateLine}</dd>
            </div>
            <div>
              <dt>Yanit zamani</dt>
              <dd>{new Date(lastApprovalSummary.at).toLocaleString("tr-TR")}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      {gateReasons.length ? (
        <section className="hz-approvals-inbox-card hz-approvals-inbox-card--warn" aria-label="Gate uyarilari">
          <h3 className="hz-approvals-inbox-card-title">Gate / safety uyarilari</h3>
          <ul className="hz-approvals-inbox-reasons">
            {gateReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <ApprovalRiskSummary item={item} />
      <ApprovalTimelinePreview item={item} />
      <ApprovalOutboxStatusCard item={item} />
      <ApprovalActionBar item={item} busy={busy} onApprove={onApprove} onReject={onReject} />
    </aside>
  );
}
