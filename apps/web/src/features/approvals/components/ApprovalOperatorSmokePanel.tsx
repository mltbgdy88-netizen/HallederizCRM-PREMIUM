"use client";

import type { LastApprovalActionSummary, OperatorSmokeSummary } from "../utils/operator-smoke";

function stepClass(status: string): string {
  switch (status) {
    case "ok":
      return "hz-approvals-operator-smoke-step hz-approvals-operator-smoke-step--ok";
    case "warning":
      return "hz-approvals-operator-smoke-step hz-approvals-operator-smoke-step--warn";
    case "fail":
      return "hz-approvals-operator-smoke-step hz-approvals-operator-smoke-step--fail";
    case "skipped":
      return "hz-approvals-operator-smoke-step hz-approvals-operator-smoke-step--skipped";
    default:
      return "hz-approvals-operator-smoke-step hz-approvals-operator-smoke-step--neutral";
  }
}

function overallLabel(overall: OperatorSmokeSummary["overall"]): string {
  switch (overall) {
    case "success":
      return "Hazir";
    case "partial":
      return "Kismi / bekleyen adimlar";
    case "blocked":
      return "Engelli";
    default:
      return overall;
  }
}

export function ApprovalOperatorSmokePanel({
  production,
  summary,
  lastSeedLine,
  lastApprovalSummary
}: {
  production: boolean;
  summary: OperatorSmokeSummary;
  lastSeedLine?: string | null;
  lastApprovalSummary?: LastApprovalActionSummary | null;
}) {
  if (production) {
    return (
      <section className="hz-approvals-operator-smoke-panel hz-approvals-operator-smoke-panel--prod" aria-label="Operator smoke">
        <header className="hz-approvals-operator-smoke-head">
          <h3 className="hz-approvals-operator-smoke-title">Operatör dogrulama</h3>
          <p className="hz-approvals-inbox-muted">
            Production ortaminda sandbox smoke checklist gosterilmez; canli veri uzerinde sahte basari uretilmez.
          </p>
        </header>
      </section>
    );
  }

  return (
    <section className="hz-approvals-operator-smoke-panel" aria-label="Sandbox smoke checklist">
      <header className="hz-approvals-operator-smoke-head">
        <h3 className="hz-approvals-operator-smoke-title">Operatör dogrulama (local/demo)</h3>
        <p className="hz-approvals-operator-smoke-overall" data-overall={summary.overall}>
          Durum: <strong>{overallLabel(summary.overall)}</strong>
          <span className="hz-approvals-operator-smoke-counts">
            {" "}
            · OK {summary.okCount} · Uyari {summary.warningCount} · Hata {summary.failCount} · Atlandi {summary.skippedCount} · Bekleyen{" "}
            {summary.neutralCount}
          </span>
        </p>
        <p className="hz-approvals-inbox-muted">
          Guvenlik: sandbox yalnizca gelistirme; provider writes ve gercek execution sinyalleri worker safety yanitindan okunur. Basari uydurulmaz.
        </p>
      </header>

      {lastSeedLine ? (
        <p className="hz-approvals-operator-smoke-meta" role="status">
          <strong>Son seed:</strong> {lastSeedLine}
        </p>
      ) : null}

      {lastApprovalSummary ? (
        <div className="hz-approvals-operator-smoke-last" role="region" aria-label="Son onay islemi">
          <p className="hz-approvals-operator-smoke-last-title">Son islem ozeti (onay)</p>
          <ul className="hz-approvals-operator-smoke-last-list">
            <li>{lastApprovalSummary.duplicate ? "Idempotent: kayit zaten islenmis." : "Onay API basarili."}</li>
            {lastApprovalSummary.executionId ? <li>executionId: {lastApprovalSummary.executionId}</li> : null}
            {lastApprovalSummary.outboxJobId ? <li>İş kuyruğu no: {lastApprovalSummary.outboxJobId}</li> : null}
            <li>Bridge: {lastApprovalSummary.bridgeLine}</li>
            <li>
              Audit/timeline writeback:{" "}
              {lastApprovalSummary.auditTimelineWritebackQueued === true
                ? "kuyrukta / yanitta true"
                : lastApprovalSummary.auditTimelineWritebackQueued === false
                  ? "false"
                  : "(alan yok)"}
            </li>
            <li>{lastApprovalSummary.gateLine}</li>
            <li className="hz-approvals-inbox-muted">Zaman: {new Date(lastApprovalSummary.at).toLocaleString("tr-TR")}</li>
          </ul>
        </div>
      ) : null}

      <ul className="hz-approvals-operator-smoke-steps">
        {summary.steps.map((step) => (
          <li key={step.id} className={stepClass(step.status)}>
            <span className="hz-approvals-operator-smoke-step-label">{step.label}</span>
            <span className="hz-approvals-operator-smoke-step-status">{step.status}</span>
            {step.detail ? <span className="hz-approvals-operator-smoke-step-detail">{step.detail}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

