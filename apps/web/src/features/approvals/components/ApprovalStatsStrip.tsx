"use client";

import { LucideIcon, type LucideIconName } from "../../../components/icons/lucide-icons";

export type ApprovalDeskStat = {
  id: string;
  label: string;
  value: string;
  subtitle: string;
  icon: LucideIconName;
  tone: "emerald" | "ruby" | "gold" | "info" | "muted";
};

export function ApprovalStatsStrip({ stats }: { stats: ApprovalDeskStat[] }) {
  return (
    <div className="hz-approval-stats" aria-label="Onay özetleri">
      {stats.map((stat) => (
        <article key={stat.id} className={`hz-approval-stat hz-approval-stat--${stat.tone}`}>
          <span className="hz-approval-stat__icon" aria-hidden>
            <LucideIcon name={stat.icon} size={15} />
          </span>
          <div className="hz-approval-stat__body">
            <p className="hz-approval-stat__label">{stat.label}</p>
            <p className="hz-approval-stat__value">{stat.value}</p>
            {stat.subtitle ? <p className="hz-approval-stat__subtitle">{stat.subtitle}</p> : null}
          </div>
        </article>
      ))}
    </div>
  );
}
