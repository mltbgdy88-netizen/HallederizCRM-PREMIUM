import type { WorkerHealthResponse } from "../types";

const READINESS_LABELS = [
  "Güvenli önizleme",
  "Kontrollü yürütme",
  "Sağlayıcı yazımı kapalı",
  "Canlı kullanıcı oluşturma kapalı"
] as const;

export function ApprovalSafetyBadge({
  repositoryMode,
  workerHealth
}: {
  repositoryMode?: string;
  workerHealth?: WorkerHealthResponse | null;
}) {
  const workerMode = workerHealth?.workerPersistenceMode ?? workerHealth?.health?.persistenceMode;
  const foundationMode = (workerHealth?.health?.mode ?? workerMode ?? repositoryMode ?? "foundation")
    .toLowerCase()
    .includes("foundation");
  const workerOk = workerHealth?.ok === true && workerHealth.health?.ok === true;
  const workerLabel = workerHealth
    ? workerOk
      ? foundationMode
        ? "Arka plan servisi: kontrollü mod"
        : "Arka plan servisi hazır"
      : "Arka plan servisi sınırlı"
    : "Servis durumu okunamadı";

  const blockers = workerHealth?.productionSafety?.blockers ?? workerHealth?.productionSafety?.reasons ?? [];
  const readinessLabels = workerHealth?.productionSafety?.labels?.length
    ? workerHealth.productionSafety.labels
    : READINESS_LABELS;

  return (
    <div className="hz-approvals-inbox-safety-row" aria-label="Üretim güvenliği ve hazırlık">
      <span className="hz-approvals-inbox-safety-badge">Veri katmanı: {repositoryMode ?? "önizleme"}</span>
      <span
        className={`hz-approvals-inbox-safety-badge${
          workerOk && !foundationMode
            ? " hz-approvals-inbox-safety-badge--ok"
            : foundationMode
              ? " hz-approvals-inbox-safety-badge--neutral"
              : ""
        }`}
      >
        {workerLabel}
        {workerMode ? ` (${workerMode})` : ""}
      </span>
      {readinessLabels.map((label) => (
        <span key={label} className="hz-approvals-inbox-safety-badge hz-approvals-inbox-safety-badge--neutral">
          {label}
        </span>
      ))}
      {blockers.length ? (
        <span className="hz-approvals-inbox-safety-badge hz-approvals-inbox-safety-badge--danger">
          Engel: {blockers.join(", ")}
        </span>
      ) : null}
      <span className="hz-approvals-inbox-safety-badge">İşlem kapısı: backend politikası</span>
    </div>
  );
}

