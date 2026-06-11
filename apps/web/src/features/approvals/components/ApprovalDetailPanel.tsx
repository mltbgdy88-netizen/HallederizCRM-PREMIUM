"use client";

import { DetailPanel } from "@hallederiz/ui";
import { useState } from "react";
import { formatUserFacingMode } from "../../../lib/user-facing-labels";
import type { ApprovalInboxItem } from "../types";
import type { LastApprovalActionSummary } from "../utils/operator-smoke";
import { ApprovalActionBar } from "./ApprovalActionBar";
import { ApprovalOutboxStatusCard } from "./ApprovalOutboxStatusCard";
import { ApprovalRiskSummary } from "./ApprovalRiskSummary";
import { ApprovalStatusBadge } from "./ApprovalStatusBadge";
import { ApprovalTimelinePreview } from "./ApprovalTimelinePreview";
import { ApprovalInboxEmpty } from "./ApprovalInboxStates";
import { getApprovalWaitingReasonSummary } from "../utils/inbox-helpers";
import { summarizeGateDecision } from "../utils/inbox-helpers";
import { EntityTimelinePanel } from "../../shared/components/EntityTimelinePanel";

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
      <DetailPanel className="hz-approvals-inbox-detail">
        <ApprovalInboxEmpty title="Onay seçin" description="Listeden bir kayıt seçerek detay, risk ve aksiyonları görüntüleyin." />
      </DetailPanel>
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
    <DetailPanel className="hz-approvals-inbox-detail" aria-labelledby="approval-detail-title">
      <header className="hz-approvals-inbox-detail-head">
        <p className="hz-approvals-inbox-eyebrow">Onay isteği</p>
        <div className="hz-approvals-inbox-detail-id-row">
          <h2 id="approval-detail-title">{item.approvalRequestId}</h2>
          <button type="button" className="hz-approvals-inbox-copy" onClick={() => void copyId()}>
            {copied ? "Kopyalandı" : "Kopyala"}
          </button>
        </div>
        <ApprovalStatusBadge status={item.status} />
      </header>

      <section className="hz-approvals-inbox-card">
        <h3 className="hz-approvals-inbox-card-title">Özet</h3>
        <dl className="hz-approvals-inbox-meta hz-approvals-inbox-meta--grid">
          <div>
            <dt>{item.status === "pending" ? "Bekleme nedeni" : item.status === "rejected" ? "Red özeti" : "Karar özeti"}</dt>
            <dd className="hz-approvals-inbox-wait-reason">{getApprovalWaitingReasonSummary(item)}</dd>
          </div>
          <div>
            <dt>Action key</dt>
            <dd>{item.actionKey}</dd>
          </div>
          <div>
            <dt>Actor</dt>
            <dd>{item.actorId}</dd>
          </div>
          <div>
            <dt>Talep zamanı</dt>
            <dd>{formatDate(item.requestedAt)}</dd>
          </div>
          <div>
            <dt>Oluşturma</dt>
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
            <dt>Tekrar güvenliği anahtarı</dt>
            <dd>{item.idempotencyKey}</dd>
          </div>
          <div>
            <dt>Red nedeni</dt>
            <dd>{item.rejectReason ?? "-"}</dd>
          </div>
          <div>
            <dt>Kiracı</dt>
            <dd>{item.tenantId}</dd>
          </div>
        </dl>
        <details className="hz-approvals-inbox-payload-details">
          <summary>İşlem özeti</summary>
          <pre className="hz-approvals-inbox-payload">{payloadPreview}</pre>
        </details>
      </section>

      <section className="hz-approvals-inbox-card">
        <h3 className="hz-approvals-inbox-card-title">Çalışma zamanı özeti</h3>
        <dl className="hz-approvals-inbox-meta hz-approvals-inbox-meta--grid">
          <div>
            <dt>İşlem no</dt>
            <dd>{item.executionId ?? "-"}</dd>
          </div>
          <div>
            <dt>İş kuyruğu no</dt>
            <dd>{item.outboxJobId ?? "-"}</dd>
          </div>
          <div>
            <dt>İşlem modu</dt>
            <dd>{formatUserFacingMode(item.bridgeTransactionMode)}</dd>
          </div>
          <div>
            <dt>Kalıcılık modu</dt>
            <dd>{formatUserFacingMode(item.bridgePersistenceMode)}</dd>
          </div>
          <div>
            <dt>Denetim zaman çizelgesi</dt>
            <dd>
              {item.auditTimelineWritebackQueued === true
                ? "Denetim kaydı kuyruğa alındı"
                : item.auditTimelineWritebackQueued === false
                  ? "Denetim kaydı henüz oluşmadı"
                  : item.auditRequired
                    ? "Denetim kaydı bekleniyor"
                    : "Gerekli değil"}
            </dd>
          </div>
          <div>
            <dt>Arka plan işleme</dt>
            <dd>{item.workerProcessingRecommended ? "İşlenmesi önerilir" : "Beklemede"}</dd>
          </div>
        </dl>
        <p className="hz-approvals-inbox-muted">Kapı özeti: {summarizeGateDecision(item.gateDecision)}</p>
      </section>

      {lastApprovalSummary ? (
        <section className="hz-approvals-inbox-card hz-approvals-inbox-card--last-action" aria-label="Son işlem sonucu">
          <h3 className="hz-approvals-inbox-card-title">Son işlem sonucu (onay API)</h3>
          <p className="hz-approvals-inbox-muted">
            {lastApprovalSummary.duplicate
              ? "İdempotent yanıt: kayıt zaten işlenmiş; yeni execution gönderilmedi."
              : "Onay API başarılı döndü; aşağıdaki alanlar son yanıttan."}
          </p>
          <dl className="hz-approvals-inbox-meta hz-approvals-inbox-meta--grid">
            <div>
              <dt>İşlem no</dt>
              <dd>{lastApprovalSummary.executionId ?? "-"}</dd>
            </div>
            <div>
              <dt>İş kuyruğu no</dt>
              <dd>{lastApprovalSummary.outboxJobId ?? "-"}</dd>
            </div>
            <div>
              <dt>Köprü özeti</dt>
              <dd className="hz-approvals-inbox-mono-wrap">{lastApprovalSummary.bridgeLine}</dd>
            </div>
            <div>
              <dt>Denetim zaman çizelgesi</dt>
              <dd>
                {lastApprovalSummary.auditTimelineWritebackQueued === true
                  ? "Kayıt oluşturuldu"
                  : lastApprovalSummary.auditTimelineWritebackQueued === false
                    ? "Kayıt henüz yok"
                    : "-"}
              </dd>
            </div>
            <div>
              <dt>Onay kapısı</dt>
              <dd className="hz-approvals-inbox-mono-wrap">{lastApprovalSummary.gateLine}</dd>
            </div>
            <div>
              <dt>Yanıt zamanı</dt>
              <dd>{new Date(lastApprovalSummary.at).toLocaleString("tr-TR")}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      {gateReasons.length ? (
        <section className="hz-approvals-inbox-card hz-approvals-inbox-card--warn" aria-label="Kapı uyarıları">
          <h3 className="hz-approvals-inbox-card-title">Kapı / güvenlik uyarıları</h3>
          <ul className="hz-approvals-inbox-reasons">
            {gateReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <ApprovalRiskSummary item={item} />
      <ApprovalTimelinePreview item={item} />
      <EntityTimelinePanel
        entityType={typeof item.payload?.entityType === "string" ? item.payload.entityType : "approval"}
        entityId={
          typeof item.payload?.entityId === "string"
            ? item.payload.entityId
            : item.approvalRequestId
        }
      />
      <ApprovalOutboxStatusCard item={item} />
      <ApprovalActionBar item={item} busy={busy} onApprove={onApprove} onReject={onReject} />
    </DetailPanel>
  );
}
