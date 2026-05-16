import {
  IconAlertTriangle,
  IconCheckCircle,
  IconClipboardList,
  IconClock
} from "../../../dashboard/components/dashboard-inline-icons";
import { APPROVAL_INBOX_KPI } from "../../data/approval-inbox-demo";

const CARDS = [
  { key: "pending", label: "Bekleyen Onaylar", data: APPROVAL_INBOX_KPI.pending, Icon: IconClipboardList },
  { key: "critical", label: "Kritik", data: APPROVAL_INBOX_KPI.critical, Icon: IconAlertTriangle },
  { key: "sla", label: "SLA İhlali", data: APPROVAL_INBOX_KPI.slaBreach, Icon: IconClock },
  { key: "done", label: "Bugün Sonuçlanan", data: APPROVAL_INBOX_KPI.completedToday, Icon: IconCheckCircle }
] as const;

export function ApprovalKpiCards() {
  return (
    <div className="hz-approvals-inbox-kpi-row" aria-label="Onay KPI özetleri">
      {CARDS.map((card) => (
        <article key={card.key} className={`hz-approvals-inbox-kpi hz-approvals-inbox-kpi--${card.data.tone}`}>
          <span className="hz-approvals-inbox-kpi-icon" aria-hidden>
            <card.Icon size={11} />
          </span>
          <span className="hz-approvals-inbox-kpi-label">{card.label}</span>
          <strong className="hz-approvals-inbox-kpi-value">{card.data.value}</strong>
          <span className={`hz-approvals-inbox-kpi-delta hz-approvals-inbox-kpi-delta--${card.data.tone}`}>
            {card.data.delta}
          </span>
        </article>
      ))}
    </div>
  );
}
