import {
  IconAlertTriangle,
  IconCheckCircle,
  IconClipboardList,
  IconClock
} from "../../../dashboard/components/dashboard-inline-icons";
import type { ApprovalInboxRecord } from "./types";

export function ApprovalKpiCards({ rows }: { rows: ApprovalInboxRecord[] }) {
  const pending = rows.filter((row) => row.status === "bekliyor").length;
  const critical = rows.filter((row) => row.priority === "kritik").length;
  const sla = rows.filter((row) => row.slaBreached).length;
  const doneToday = rows.filter((row) => row.recentlyResolved).length;

  const cards = [
    { key: "pending", label: "Bekleyen Onaylar", value: pending, tone: "primary", Icon: IconClipboardList },
    { key: "critical", label: "Kritik", value: critical, tone: "danger", Icon: IconAlertTriangle },
    { key: "sla", label: "SLA \u0130hlali", value: sla, tone: "warn", Icon: IconClock },
    { key: "done", label: "Bug\u00fcn Sonu\u00e7lanan", value: doneToday, tone: "success", Icon: IconCheckCircle }
  ] as const;

  return (
    <div className="hz-approvals-inbox-kpi-row" aria-label="Onay KPI \u00f6zetleri">
      {cards.map((card) => (
        <article key={card.key} className={`hz-approvals-inbox-kpi hz-approvals-inbox-kpi--${card.tone}`}>
          <span className="hz-approvals-inbox-kpi-icon" aria-hidden>
            <card.Icon size={11} />
          </span>
          <span className="hz-approvals-inbox-kpi-label">{card.label}</span>
          <strong className="hz-approvals-inbox-kpi-value">{card.value}</strong>
        </article>
      ))}
    </div>
  );
}
