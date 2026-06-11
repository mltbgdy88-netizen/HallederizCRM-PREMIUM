"use client";

import { LucideIcon } from "../../../components/icons/lucide-icons";
import { canInboxApprove, canInboxReject } from "../utils/approval-action-feedback";
import {
  approvalOperationTypeLabel,
  approvalRiskLabel,
  approvalSourceFromRecord,
  approvalSourceLabel,
  approvalWhyRequiredText
} from "../utils/approval-command-desk-present";
import type { ApprovalInboxRecord } from "./inbox/types";

type ApprovalCommandDeskDecisionProps = {
  record: ApprovalInboxRecord | null;
  actionPending: "approve" | "reject" | null;
  onApprove: () => void;
  onReject: () => void;
  onOpenDetail: () => void;
};

export function ApprovalCommandDeskDecision({
  record,
  actionPending,
  onApprove,
  onReject,
  onOpenDetail
}: ApprovalCommandDeskDecisionProps) {
  if (!record) {
    return (
      <aside className="hz-approval-decision hz-approval-panel hz-approval-panel--empty" aria-label="Karar paneli">
        <p className="hz-approval-panel__empty">Karar için listeden bir kayıt seçin.</p>
      </aside>
    );
  }

  const source = approvalSourceFromRecord(record);
  const risk = approvalRiskLabel(record);
  const approval = record.raw;
  const approveDisabled = actionPending !== null || !canInboxApprove(approval);
  const rejectDisabled = actionPending !== null || !canInboxReject(approval);

  return (
    <aside className="hz-approval-decision hz-approval-panel" aria-label="Karar paneli">
      <header className="hz-approval-panel__head">
        <h2 className="hz-approval-panel__title">Karar Paneli</h2>
      </header>

      <div className="hz-approval-decision__body">
        <article className={`hz-approval-risk-card hz-approval-risk-card--${risk === "Yüksek" ? "high" : risk === "Orta" ? "mid" : "low"}`}>
          <p className="hz-approval-risk-card__label">Risk Seviyesi</p>
          <p className="hz-approval-risk-card__value">
            <LucideIcon name="shield-alert" size={14} />
            {risk}
          </p>
        </article>

        <p className="hz-approval-decision-note">{approvalWhyRequiredText(source)}</p>

        <dl className="hz-approval-decision-meta">
          <div>
            <dt>İşlem Türü</dt>
            <dd>{approvalOperationTypeLabel(approval.type)}</dd>
          </div>
          <div>
            <dt>Kaynak</dt>
            <dd>{approvalSourceLabel(source)}</dd>
          </div>
        </dl>
      </div>

      <div className="hz-approval-decision__actions">
        <div className="hz-approval-action-stack">
          <button
            type="button"
            className="hz-approval-button-primary"
            disabled={approveDisabled}
            onClick={onApprove}
          >
            <LucideIcon name="check-circle-2" size={14} />
            {actionPending === "approve" ? "Onaylanıyor…" : "Onayla"}
          </button>
          <button
            type="button"
            className="hz-approval-button-danger"
            disabled={rejectDisabled}
            onClick={onReject}
          >
            <LucideIcon name="x" size={14} />
            {actionPending === "reject" ? "Reddediliyor…" : "Reddet"}
          </button>
          <button type="button" className="hz-approval-button-secondary" onClick={onOpenDetail}>
            <LucideIcon name="external-link" size={14} />
            Detayı Aç
          </button>
        </div>
        <p className="hz-approval-decision-foot">Manuel kullanıcı işlemleri onay beklemez.</p>
      </div>
    </aside>
  );
}
