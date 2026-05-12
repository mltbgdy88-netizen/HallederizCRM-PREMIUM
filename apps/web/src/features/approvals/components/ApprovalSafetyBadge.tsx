import type { WorkerHealthResponse } from "../types";

const READINESS_LABELS = [
  "Safe Foundation",
  "Controlled Execution",
  "Provider Writes Disabled",
  "Real User Create Disabled"
] as const;

export function ApprovalSafetyBadge({
  repositoryMode,
  workerHealth
}: {
  repositoryMode?: string;
  workerHealth?: WorkerHealthResponse | null;
}) {
  const workerMode = workerHealth?.workerPersistenceMode ?? workerHealth?.health?.persistenceMode;
  const foundationMode = (workerHealth?.health?.mode ?? workerMode ?? repositoryMode ?? "foundation").toLowerCase().includes("foundation");
  const workerOk = workerHealth?.ok === true && workerHealth.health?.ok === true;
  const workerLabel = workerHealth
    ? workerOk
      ? foundationMode
        ? "Worker foundation / controlled mode"
        : "Worker foundation hazir"
      : "Worker foundation sinirli"
    : "Worker health okunamadi";

  const blockers = workerHealth?.productionSafety?.blockers ?? workerHealth?.productionSafety?.reasons ?? [];
  const readinessLabels = workerHealth?.productionSafety?.labels?.length
    ? workerHealth.productionSafety.labels
    : READINESS_LABELS;

  return (
    <div className="hz-approvals-inbox-safety-row" aria-label="Production safety ve readiness">
      <span className="hz-approvals-inbox-safety-badge">
        Repository: {repositoryMode ?? "foundation"}
      </span>
      <span
        className={`hz-approvals-inbox-safety-badge${
          workerOk && !foundationMode ? " hz-approvals-inbox-safety-badge--ok" : foundationMode ? " hz-approvals-inbox-safety-badge--neutral" : ""
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
          Blocker: {blockers.join(", ")}
        </span>
      ) : null}
      <span className="hz-approvals-inbox-safety-badge">Mutation gate: backend policy</span>
    </div>
  );
}
