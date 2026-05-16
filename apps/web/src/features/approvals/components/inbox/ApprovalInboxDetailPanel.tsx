"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { ApprovalInboxRecord } from "../../data/approval-inbox-demo";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";

const MAX_RISK_BULLETS = 3;
const MAX_TIMELINE_STEPS = 5;

const RISK_LEVEL_LABELS: Record<NonNullable<ApprovalInboxRecord["riskLevel"]>, string> = {
  dusuk: "DÜŞÜK RİSK",
  orta: "ORTA RİSK",
  yuksek: "YÜKSEK RİSK",
  kritik: "KRİTİK RİSK"
};

type ApprovalInboxDetailPanelProps = {
  record: ApprovalInboxRecord | null;
  actionDone: Record<string, boolean>;
  onApprove: () => void;
  onReject: () => void;
  onSendToReview: () => void;
  onOpenFull: () => void;
};

function contextLinksForPanel(record: ApprovalInboxRecord) {
  return record.contextLinks.filter((link) => {
    const m = link.label.match(/^(?:Cari|Müşteri):\s*(.+)$/i);
    if (!m) return true;
    return m[1]?.trim() !== record.customerName;
  });
}

export function ApprovalInboxDetailPanel({
  record,
  actionDone,
  onApprove,
  onReject,
  onSendToReview,
  onOpenFull
}: ApprovalInboxDetailPanelProps) {
  if (!record) {
    return (
      <aside className="hz-approvals-inbox-desk-detail hz-approvals-inbox-desk-detail--empty">
        <p className="hz-approvals-inbox-desk-detail-empty-title">Kayıt seçilmedi</p>
        <p className="hz-approvals-inbox-desk-detail-empty-text">Listeden bir onay satırı seçin.</p>
      </aside>
    );
  }

  const disabled = actionDone[record.id] === true;
  const contextLinks = contextLinksForPanel(record);
  const riskBullets = record.riskBullets.slice(0, MAX_RISK_BULLETS);
  const timelineSteps = record.timeline.slice(0, MAX_TIMELINE_STEPS);
  const isAi = record.priority === "ai" || record.category === "ai";

  return (
    <aside
      className={`hz-approvals-inbox-desk-detail${isAi ? " hz-approvals-inbox-desk-detail--ai" : ""}`}
      aria-label="Seçili kayıt karar paneli"
    >
      <header className="hz-approvals-inbox-desk-detail-head">
        <div className="hz-approvals-inbox-desk-detail-head-main">
          <h2 className="hz-approvals-inbox-desk-detail-title">{record.title}</h2>
          <p className="hz-approvals-inbox-desk-detail-id">{record.approvalNo}</p>
        </div>
        <StatusBadge status={record.status} />
      </header>

      <div className="hz-approvals-inbox-desk-detail-scroll">
        <DetailSection title="Onay Özeti">
          <dl className="hz-approvals-inbox-desk-kv hz-approvals-inbox-desk-kv--decision">
            <div>
              <dt>Tür</dt>
              <dd>{record.summary.typeLabel}</dd>
            </div>
            <div>
              <dt>Öncelik</dt>
              <dd>
                <PriorityBadge priority={record.priority} />
              </dd>
            </div>
            <div>
              <dt>Talep Tutarı</dt>
              <dd>{record.summary.amountTry}</dd>
            </div>
            <div>
              <dt>İlgili Kayıt</dt>
              <dd>
                <Link href={record.summary.relatedRecordHref} className="hz-approvals-inbox-desk-link">
                  {record.summary.relatedRecordLabel}
                </Link>
              </dd>
            </div>
            <div>
              <dt>Talep Eden</dt>
              <dd>{record.summary.requesterName}</dd>
            </div>
            <div>
              <dt>Talep Tarihi</dt>
              <dd>{record.summary.requestedAt}</dd>
            </div>
            <div>
              <dt>SLA Bitişi</dt>
              <dd>{record.summary.slaDeadline}</dd>
            </div>
          </dl>
        </DetailSection>

        {riskBullets.length > 0 ? (
          <DetailSection title="İş Riski Özeti">
            <div className="hz-approvals-inbox-desk-risk-box">
              {record.riskLevel ? (
                <span className={`hz-approvals-inbox-desk-risk-tag hz-approvals-inbox-desk-risk-tag--${record.riskLevel}`}>
                  {RISK_LEVEL_LABELS[record.riskLevel]}
                </span>
              ) : null}
              <ul className="hz-approvals-inbox-desk-risk-list">
                {riskBullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <Link href={record.summary.relatedRecordHref} className="hz-approvals-inbox-desk-link hz-approvals-inbox-desk-risk-link">
                Detaylı risk analizi
              </Link>
            </div>
          </DetailSection>
        ) : null}

        <DetailSection title="İlgili Bağlam">
          <ul className="hz-approvals-inbox-desk-context">
            <li>
              <Link href="/cariler" className="hz-approvals-inbox-desk-link">
                Müşteri: {record.customerName}
              </Link>
            </li>
            {contextLinks.map((link) => (
              <li key={`${link.href}-${link.label}`}>
                <Link href={link.href} className="hz-approvals-inbox-desk-link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </DetailSection>

        {timelineSteps.length > 0 ? (
          <DetailSection title="Denetim Zaman Çizelgesi" className="hz-approvals-inbox-desk-detail-section--timeline">
            <ol className="hz-approvals-inbox-desk-timeline">
              {timelineSteps.map((step, index) => (
                <li key={step.id} className={index === timelineSteps.length - 1 ? "is-last" : undefined}>
                  <span className="hz-approvals-inbox-desk-timeline-dot" aria-hidden />
                  <div>
                    <strong>{step.label}</strong>
                    <small>{step.at}</small>
                  </div>
                </li>
              ))}
            </ol>
          </DetailSection>
        ) : null}

        <DetailSection title="İç Notlar">
          <article className="hz-approvals-inbox-desk-note">
            <p className="hz-approvals-inbox-desk-note-meta">
              <strong>{record.internalNote.author}</strong>
              <span>{record.internalNote.at}</span>
            </p>
            <p className="hz-approvals-inbox-desk-note-body">{record.internalNote.body}</p>
          </article>
        </DetailSection>
      </div>

      <footer className="hz-approvals-inbox-desk-detail-foot">
        <div className="hz-approvals-inbox-desk-detail-actions hz-approvals-inbox-desk-detail-actions--row" aria-label="Karar aksiyonları">
          <button
            type="button"
            className="hz-approvals-inbox-desk-act hz-approvals-inbox-desk-act--success"
            disabled={disabled}
            onClick={onApprove}
          >
            Onayla
          </button>
          <button
            type="button"
            className="hz-approvals-inbox-desk-act hz-approvals-inbox-desk-act--danger"
            disabled={disabled}
            onClick={onReject}
          >
            Reddet
          </button>
          <button
            type="button"
            className="hz-approvals-inbox-desk-act hz-approvals-inbox-desk-act--info"
            disabled={disabled}
            onClick={onSendToReview}
          >
            İncelemeye Gönder
          </button>
          <button
            type="button"
            className="hz-approvals-inbox-desk-act hz-approvals-inbox-desk-act--outline"
            onClick={onOpenFull}
          >
            Tam Kaydı Aç
          </button>
        </div>
      </footer>
    </aside>
  );
}

function DetailSection({
  title,
  children,
  className
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`hz-approvals-inbox-desk-detail-section${className ? ` ${className}` : ""}`}>
      <h3>{title}</h3>
      <div className="hz-approvals-inbox-desk-detail-section-body">{children}</div>
    </section>
  );
}
