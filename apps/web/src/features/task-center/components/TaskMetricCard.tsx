import type { DashboardCard } from "@hallederiz/types";
import { CRMIcon, type CRMIconName } from "../../../components/icons";

function severityClass(severity: DashboardCard["severity"]) {
  if (severity === "critical") return "hz-badge hz-badge-danger";
  if (severity === "warning") return "hz-badge hz-badge-warning";
  return "hz-badge hz-badge-info";
}

export function TaskMetricCard({ card, onOpen }: { card: DashboardCard; onOpen: (card: DashboardCard) => void }) {
  return (
    <button type="button" className={`hz-task-card ${card.pulse ? "is-pulse" : ""}`} onClick={() => onOpen(card)}>
      <div className="hz-task-card-header">
        <span className={severityClass(card.severity)}>{card.source === "ai" ? "AI" : "Sistem"}</span>
        <CRMIcon name={card.icon as CRMIconName} />
      </div>
      <h3 className="hz-card-title">{card.title}</h3>
      <p className="hz-task-card-value">{card.value}</p>
      <p className="hz-task-card-sub">{card.detail}</p>
    </button>
  );
}
