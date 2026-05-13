"use client";

import { useState } from "react";
import type { ApprovalInboxItem } from "../types";
import {
  describeApprovalFlowSteps,
  formatApprovalDisplayId,
  formatApprovalRelativeTime,
  getApprovalSourceLabel,
  mapApprovalCardTag,
  mapApprovalCardTitle,
  mapApprovalRiskLabel,
  mapApprovalRiskLevel,
  summarizeApprovalAmount,
  summarizeApprovalBusinessContext,
  summarizeApprovalCardDescription
} from "../utils/approval-card-helpers";
import { describeApprovalActionDisabledReason, isApprovalActionAvailable, validateRejectReason } from "../utils/inbox-helpers";

export function ApprovalTaskCard({
  item,
  selected,
  onSelect,
  actionBusy,
  actingOnId,
  onApprove,
  onReject
}: {
  item: ApprovalInboxItem;
  selected: boolean;
  onSelect: (id: string) => void;
  /** Herhangi bir kartta API aksiyonu sürüyor. */
  actionBusy: boolean;
  /** Yükleme göstergesi bu kayıt için mi. */
  actingOnId: string | null;
  onApprove: (approvalRequestId: string) => void;
  onReject: (approvalRequestId: string, reason: string) => void;
}) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectDraft, setRejectDraft] = useState("");
  const [rejectWarn, setRejectWarn] = useState<string | null>(null);
  const pending = isApprovalActionAvailable(item);
  const thisActing = actingOnId === item.approvalRequestId;
  const risk = mapApprovalRiskLevel(item);
  const riskClass =
    risk === "high"
      ? "hz-approvals-inbox-risk-pill hz-approvals-inbox-risk-pill--high"
      : risk === "medium"
        ? "hz-approvals-inbox-risk-pill hz-approvals-inbox-risk-pill--medium"
        : risk === "low"
          ? "hz-approvals-inbox-risk-pill hz-approvals-inbox-risk-pill--low"
          : "hz-approvals-inbox-risk-pill hz-approvals-inbox-risk-pill--neutral";
  const source = getApprovalSourceLabel(item);
  const sourceClass =
    source.key === "whatsapp"
      ? "hz-approvals-inbox-source hz-approvals-inbox-source--wa"
      : "hz-approvals-inbox-source hz-approvals-inbox-source--generic";

  const disabledReason = describeApprovalActionDisabledReason(item);

  const submitReject = () => {
    const err = validateRejectReason(rejectDraft);
    if (err) {
      setRejectWarn(err);
      return;
    }
    setRejectWarn(null);
    onReject(item.approvalRequestId, rejectDraft.trim());
    setRejectOpen(false);
    setRejectDraft("");
  };

  return (
    <article
      className={`hz-approvals-inbox-task-card${selected ? " is-selected" : ""}`}
      aria-current={selected ? "true" : undefined}
    >
      <button type="button" className="hz-approvals-inbox-task-card-hit" onClick={() => onSelect(item.approvalRequestId)} aria-label="Kartı seç">
        <div className="hz-approvals-inbox-task-card-top">
          <span className={riskClass}>{mapApprovalRiskLabel(risk)}</span>
          <time className="hz-approvals-inbox-task-time" dateTime={item.requestedAt}>
            {formatApprovalRelativeTime(item.requestedAt)}
          </time>
        </div>
        <div className="hz-approvals-inbox-task-card-row">
          <span className={sourceClass}>{source.label}</span>
          <span className="hz-approvals-inbox-task-tag">{mapApprovalCardTag(item)}</span>
        </div>
        <h3 className="hz-approvals-inbox-task-title">{mapApprovalCardTitle(item.actionKey)}</h3>
        <p className="hz-approvals-inbox-task-desc">{summarizeApprovalCardDescription(item)}</p>
        <p className="hz-approvals-inbox-task-context">{summarizeApprovalBusinessContext(item)}</p>
        <p className="hz-approvals-inbox-task-amount">{summarizeApprovalAmount(item)}</p>
        <div className="hz-approvals-inbox-task-foot">
          <span className="hz-approvals-inbox-task-id">{formatApprovalDisplayId(item.approvalRequestId)}</span>
          <span className="hz-approvals-inbox-task-steps">{describeApprovalFlowSteps(item)}</span>
        </div>
      </button>
      <div className="hz-approvals-inbox-task-actions">
        <button
          type="button"
          className="hz-approvals-inbox-btn hz-approvals-inbox-btn--primary hz-approvals-inbox-task-btn"
          disabled={!pending || actionBusy}
          onClick={(e) => {
            e.stopPropagation();
            onApprove(item.approvalRequestId);
          }}
        >
          {actionBusy && thisActing ? "İşleniyor..." : "Onayla"}
        </button>
        <button
          type="button"
          className="hz-approvals-inbox-btn hz-approvals-inbox-btn--danger-outline hz-approvals-inbox-task-btn"
          disabled={!pending || actionBusy}
          onClick={(e) => {
            e.stopPropagation();
            setRejectOpen((v) => !v);
            setRejectWarn(null);
          }}
        >
          Reddet
        </button>
      </div>
      {!pending && disabledReason ? <p className="hz-approvals-inbox-muted hz-approvals-inbox-task-disabled">{disabledReason}</p> : null}
      {rejectOpen && pending ? (
        <div className="hz-approvals-inbox-task-reject" onClick={(e) => e.stopPropagation()}>
          <label className="hz-approvals-inbox-field" htmlFor={`reject-${item.approvalRequestId}`}>
            <span>Red nedeni</span>
            <input
              id={`reject-${item.approvalRequestId}`}
              className="hz-approvals-inbox-input"
              value={rejectDraft}
              placeholder="Zorunlu"
              onChange={(ev) => {
                setRejectDraft(ev.target.value);
                if (rejectWarn) setRejectWarn(null);
              }}
            />
          </label>
          {rejectWarn ? <p className="hz-approvals-inbox-action-warning">{rejectWarn}</p> : null}
          <div className="hz-approvals-inbox-task-reject-row">
            <button type="button" className="hz-approvals-inbox-btn hz-approvals-inbox-btn--danger" disabled={actionBusy} onClick={() => void submitReject()}>
              Reddi gönder
            </button>
            <button type="button" className="hz-approvals-inbox-btn" disabled={actionBusy} onClick={() => setRejectOpen(false)}>
              Vazgeç
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
