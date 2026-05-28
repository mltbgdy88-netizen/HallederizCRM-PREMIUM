// @ts-nocheck
"use client";

import Link from "next/link";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { sanitizeUserFacingText } from "../utils/approval-action-feedback";
import {
  approvalOperationTypeLabel,
  approvalRiskLabel,
  approvalSourceEngineLabel,
  approvalSourceFromRecord,
  approvalSourceLabel,
  linkedRecordChips,
  proposedActionBullets
} from "../utils/approval-command-desk-present";
import type { ApprovalInboxRecord } from "./inbox/types";

type ApprovalCommandDeskDetailProps = {
  record: ApprovalInboxRecord | null;
  detailLoading: boolean;
  detailError: string | null;
};

export function ApprovalCommandDeskDetail({ record, detailLoading, detailError }: ApprovalCommandDeskDetailProps) {
  if (!record) {
    return (
      <section className="hz-approval-detail hz-approval-panel hz-approval-panel--empty" aria-label="Onay detayÄ±">
        <p className="hz-approval-panel__empty">Listeden bir kayÄ±t seÃ§in.</p>
      </section>
    );
  }

  const source = approvalSourceFromRecord(record);
  const risk = approvalRiskLabel(record);
  const bullets = proposedActionBullets(record);
  const chips = linkedRecordChips(record);
  const description = sanitizeUserFacingText(
    record.raw.payloadSummary || record.internalNote.body || record.workflowLabel
  );

  return (
    <section className="hz-approval-detail hz-approval-panel" aria-label="Onay detayÄ±">
      <header className="hz-approval-panel__head">
        <div>
          <h2 className="hz-approval-panel__title">Onay DetayÄ±</h2>
          <span className={`hz-approval-source-badge hz-approval-source-badge--${source}`}>
            <LucideIcon name={source === "ai" ? "sparkles" : source === "message" ? "message-circle" : "settings"} size={13} />
            {approvalSourceLabel(source)}
          </span>
        </div>
      </header>

      <div className="hz-approval-detail__scroll">
        {detailLoading ? <p className="hz-approval-detail__hint">Detay gÃ¼ncelleniyorâ€¦</p> : null}
        {detailError ? <p className="hz-approval-detail__hint hz-approval-detail__hint--error">{detailError}</p> : null}

        <h3 className="hz-approval-detail__title">{record.title}</h3>
        <p className="hz-approval-detail__desc">{description || "Bilgi bekleniyor"}</p>

        <section className="hz-approval-detail__section">
          <h4>BaÄŸlÄ± KayÄ±tlar</h4>
          <div className="hz-approval-chip-row">
            {chips.map((chip) =>
              chip.href ? (
                <Link key={chip.label} href={chip.href} className="hz-approval-chip">
                  {chip.label}
                </Link>
              ) : (
                <span key={chip.label} className="hz-approval-chip">
                  {chip.label}
                </span>
              )
            )}
          </div>
        </section>

        <section className="hz-approval-detail__section">
          <h4>Ã–nerilen Ä°ÅŸlem</h4>
          <ul className="hz-approval-detail__bullets">
            {bullets.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        <section className="hz-approval-detail__section">
          <h4>Etkiler</h4>
          <div className="hz-approval-impact-grid">
            <article className="hz-approval-impact">
              <p className="hz-approval-impact__label">Nakit AkÄ±ÅŸÄ±</p>
              <p className="hz-approval-impact__value">{record.amountLabel || "â€”"}</p>
            </article>
            <article className="hz-approval-impact">
              <p className="hz-approval-impact__label">Gecikme</p>
              <p className="hz-approval-impact__value">{record.slaLabel || "â€”"}</p>
            </article>
            <article className="hz-approval-impact">
              <p className="hz-approval-impact__label">Risk</p>
              <p className="hz-approval-impact__value">{risk}</p>
            </article>
          </div>
        </section>

        <section className="hz-approval-detail__section">
          <h4>AÃ§Ä±klama</h4>
          <p className="hz-approval-detail__note">
            {sanitizeUserFacingText(record.internalNote.body) || "CanlÄ± veri geldiÄŸinde burada gÃ¶rÃ¼nÃ¼r."}
          </p>
        </section>

        <footer className="hz-approval-detail__meta">
          <span>OluÅŸturulma: {record.meta.requestedAt}</span>
          <span>Kaynak: {approvalSourceEngineLabel(source)}</span>
          <span>Ä°ÅŸlem: {approvalOperationTypeLabel(record.raw.type)}</span>
        </footer>
      </div>
    </section>
  );
}

