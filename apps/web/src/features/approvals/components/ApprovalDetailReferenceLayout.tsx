"use client";

import Link from "next/link";
import type { Approval } from "@hallederiz/types";
import { useApprovalDetailReferenceState } from "../hooks/use-approval-detail-reference-state";
import { IconBack, IconDownload } from "./approval-detail-reference-icons";

type Props = {
  approval: Approval;
};

export function ApprovalDetailReferenceLayout({ approval }: Props) {
  const desk = useApprovalDetailReferenceState(approval);
  const view = desk.view;

  return (
    <div className="odk-home odk-home--embedded" data-page="approval-detail-reference" aria-live="polite">
      <header className="odk-head">
        <div>
          <p className="odk-crumb">{view.breadcrumb}</p>
          <h1>{view.title}</h1>
        </div>
        <div className="odk-head-meta">
          <button type="button" className="odk-btn odk-btn--ghost" onClick={desk.goBack}>
            <IconBack />
            Komut masası
          </button>
          <span>Onay No: {view.approvalNo}</span>
          <span className="odk-badge odk-badge--type">{view.typeLabel}</span>
        </div>
      </header>

      <div className="odk-workspace">
        <div className="odk-main">
          <article className="odk-product-card">
            <header>
              <span className={`odk-badge odk-badge--${view.statusTone}`}>{view.statusLabel}</span>
              <span className="odk-meta">
                Oluşturulma: {view.createdLabel} · {view.requesterLabel}
              </span>
            </header>
            <div className="odk-product-hero">
              <span className="odk-thumb" aria-hidden />
              <div>
                <span className="odk-product-code">{view.entityCode}</span>
                <h2>{view.entityName}</h2>
                <span className="odk-badge odk-badge--stock">{view.entityStockStatus}</span>
              </div>
            </div>
            <dl className="odk-fields-grid">
              {view.summaryFields.map((field) => (
                <div key={field.label}>
                  <dt>{field.label}</dt>
                  <dd>{field.value}</dd>
                </div>
              ))}
            </dl>
          </article>

          {view.priceComparison ? (
            <section className="odk-price-section">
              <h3>Fiyat Karşılaştırması</h3>
              <div className="odk-price-row">
                <article>
                  <span>{view.priceComparison.current.label}</span>
                  <strong>{view.priceComparison.current.price}</strong>
                  <small>{view.priceComparison.current.supplier}</small>
                </article>
                <article className="odk-price-diff">
                  <span>Fiyat Farkı</span>
                  <strong>{view.priceComparison.diff}</strong>
                </article>
                <article>
                  <span>{view.priceComparison.requested.label}</span>
                  <strong>{view.priceComparison.requested.price}</strong>
                  <small>{view.priceComparison.requested.supplier}</small>
                </article>
              </div>
            </section>
          ) : null}

          <section className="odk-reason">
            <h3>Gerekçe</h3>
            <p>{view.reason}</p>
          </section>

          {view.attachments.length > 0 ? (
            <section className="odk-attachments">
              <h3>Ekler</h3>
              <ul>
                {view.attachments.map((attachment) => (
                  <li key={attachment.name}>
                    <span>{attachment.name}</span>
                    <span>{attachment.size}</span>
                    <button type="button" aria-label={`${attachment.name} indir`} disabled title="Canlı indirme bağlandığında etkinleşir">
                      <IconDownload />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="odk-related">
            <h3>İlgili Bilgiler</h3>
            <dl className="odk-related-grid">
              {view.related.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>
                    {row.href ? (
                      <Link href={row.href} className="odk-inline-link">
                        {row.value}
                      </Link>
                    ) : (
                      row.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <aside className="odk-side">
          <article className="odk-panel">
            <h3>Risk Özeti</h3>
            <ul className="odk-risk-list">
              {view.risks.map((risk) => (
                <li key={risk.label}>
                  <span className={`odk-dot odk-dot--${risk.tone}`} aria-hidden />
                  <span>{risk.label}</span>
                  <strong>{risk.value}</strong>
                </li>
              ))}
            </ul>
          </article>
          <article className="odk-panel">
            <h3>Tutar Etkisi</h3>
            <dl className="odk-impact-dl">
              {view.impact.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd className={item.negative ? "odk-negative" : undefined}>{item.value}</dd>
                </div>
              ))}
            </dl>
          </article>
          <article className="odk-panel">
            <h3>Denetim Geçmişi</h3>
            <ol className="odk-history">
              {view.history.map((entry) => (
                <li key={entry.id}>
                  <strong>{entry.actor}</strong>
                  <span>
                    {entry.action} · {entry.time}
                  </span>
                </li>
              ))}
            </ol>
          </article>
          <article className="odk-panel odk-panel--meta">
            <h3>Onay Bilgileri</h3>
            <p className="odk-panel-lead">{view.whyRequired}</p>
            <dl className="odk-meta-dl">
              {view.metaRows.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </article>
        </aside>
      </div>

      <footer className="odk-action-bar">
        <button
          type="button"
          className="odk-btn odk-btn--approve"
          disabled={desk.approveDisabled}
          onClick={() => void desk.runAction("approve")}
        >
          {desk.actionPending === "approve" ? "Onaylanıyor…" : "Onayla"}
        </button>
        <button
          type="button"
          className="odk-btn odk-btn--reject"
          disabled={desk.rejectDisabled}
          onClick={() => void desk.runAction("reject")}
        >
          {desk.actionPending === "reject" ? "Reddediliyor…" : "Reddet"}
        </button>
        <button type="button" className="odk-btn odk-btn--review" onClick={desk.goReviewQueue}>
          İncele
        </button>
        <button
          type="button"
          className="odk-btn odk-btn--execute"
          disabled={desk.executeDisabled}
          title={desk.executeDisabledReason ?? undefined}
          onClick={() => void desk.runAction("execute")}
        >
          {desk.actionPending === "execute" ? "İşleniyor…" : "İşle"}
        </button>
        <button type="button" className="odk-btn odk-btn--ghost" onClick={desk.goEntity}>
          İlgili kayda git
        </button>
      </footer>
    </div>
  );
}
