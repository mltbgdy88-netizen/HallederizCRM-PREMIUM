import type { WorkerHealthResponse } from "../types";

export function ApprovalSafetyBadge({
  repositoryMode,
  workerHealth
}: {
  repositoryMode?: string;
  workerHealth?: WorkerHealthResponse | null;
}) {
  const workerMode = workerHealth?.workerPersistenceMode ?? workerHealth?.health?.persistenceMode;
  const workerOk = workerHealth?.ok === true && workerHealth.health?.ok === true;
  const workerLabel = workerHealth
    ? workerOk
      ? "Worker foundation hazir"
      : "Worker foundation sinirli"
    : "Worker health okunamadi";

  return (
    <div className="hz-approvals-inbox-safety-row" aria-label="Production safety ve readiness">
      <span className="hz-approvals-inbox-safety-badge">
        Repository: {repositoryMode ?? "foundation"}
      </span>
      <span className={`hz-approvals-inbox-safety-badge${workerOk ? " hz-approvals-inbox-safety-badge--ok" : ""}`}>
        {workerLabel}
        {workerMode ? ` (${workerMode})` : ""}
      </span>
      <span className="hz-approvals-inbox-safety-badge">Mutation gate: backend policy</span>
    </div>
  );
}
