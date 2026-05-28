// @ts-nocheck
"use client";

import { LucideIcon } from "../../../components/icons/lucide-icons";
import type { OrdersDeskStat } from "../utils/orders-desk-view-model";

export function OrdersStatsStrip({ stats }: { stats: OrdersDeskStat[] }) {
  return (
    <div className="hz-orders-stats" aria-label="SipariÅŸ Ã¶zetleri">
      {stats.map((stat) => (
        <article key={stat.id} className={`hz-orders-stat hz-orders-stat--${stat.tone}`}>
          <span className="hz-orders-stat__icon" aria-hidden>
            <LucideIcon name={stat.icon} size={15} />
          </span>
          <div className="hz-orders-stat__body">
            <p className="hz-orders-stat__label">{stat.label}</p>
            <p className="hz-orders-stat__value">{stat.value}</p>
            {stat.subtitle ? <p className="hz-orders-stat__subtitle">{stat.subtitle}</p> : null}
          </div>
        </article>
      ))}
    </div>
  );
}

