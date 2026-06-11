"use client";

import { formatUserFacingStatus } from "../../../lib/user-facing-labels";
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
      return "Hazır";
    case "partial":
      return "Kısmi / bekleyen adımlar";
    case "blocked":
      return "Engellendi";
    default:
      return formatUserFacingStatus(overall);
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
      <section className="hz-approvals-operator-smoke-panel hz-approvals-operator-smoke-panel--prod" aria-label="Operatör doğrulama">
        <header className="hz-approvals-operator-smoke-head">
          <h3 className="hz-approvals-operator-smoke-title">Operatör doğrulama</h3>
          <p className="hz-approvals-inbox-muted">
            Canlı ortamda test ortamı doğrulama listesi gösterilmez; canlı veri üzerinde sahte başarı üretilmez.
          </p>
        </header>
      </section>
    );
  }

  return (
    <section className="hz-approvals-operator-smoke-panel" aria-label="Test ortamı doğrulama listesi">
      <header className="hz-approvals-operator-smoke-head">
        <h3 className="hz-approvals-operator-smoke-title">Operatör doğrulama (yerel/örnek veri)</h3>
        <p className="hz-approvals-operator-smoke-overall" data-overall={summary.overall}>
          Durum: <strong>{overallLabel(summary.overall)}</strong>
          <span className="hz-approvals-operator-smoke-counts">
            {" "}
            · Tamam {summary.okCount} · Uyarı {summary.warningCount} · Hata {summary.failCount} · Atlandı {summary.skippedCount} · Bekleyen{" "}
            {summary.neutralCount}
          </span>
        </p>
        <p className="hz-approvals-inbox-muted">
          Güvenlik: test ortamı yalnızca geliştirme içindir; sağlayıcı yazımları ve gerçek çalıştırma sinyalleri çalışan servis güvenlik yanıtından okunur. Başarı uydurulmaz.
        </p>
      </header>

      {lastSeedLine ? (
        <p className="hz-approvals-operator-smoke-meta" role="status">
          <strong>Son örnek veri:</strong> {lastSeedLine}
        </p>
      ) : null}

      {lastApprovalSummary ? (
        <div className="hz-approvals-operator-smoke-last" role="region" aria-label="Son onay işlemi">
          <p className="hz-approvals-operator-smoke-last-title">Son işlem özeti (onay)</p>
          <ul className="hz-approvals-operator-smoke-last-list">
            <li>{lastApprovalSummary.duplicate ? "Tekrar güvenli: kayıt zaten işlenmiş." : "Onay API başarılı."}</li>
            {lastApprovalSummary.executionId ? <li>Çalıştırma no: {lastApprovalSummary.executionId}</li> : null}
            {lastApprovalSummary.outboxJobId ? <li>İş kuyruğu no: {lastApprovalSummary.outboxJobId}</li> : null}
            <li>Köprü: {lastApprovalSummary.bridgeLine}</li>
            <li>
              Denetim izi / zaman akışı geri yazımı:{" "}
              {lastApprovalSummary.auditTimelineWritebackQueued === true
                ? "kuyrukta / yanıtta evet"
                : lastApprovalSummary.auditTimelineWritebackQueued === false
                  ? "hayır"
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
            <span className="hz-approvals-operator-smoke-step-status">{formatUserFacingStatus(step.status)}</span>
            {step.detail ? <span className="hz-approvals-operator-smoke-step-detail">{step.detail}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
