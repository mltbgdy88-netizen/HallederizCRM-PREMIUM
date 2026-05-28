"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { KpiIcon } from "@/components/reference/icons";
import type { KatmanTabId } from "@/features/teklifler/data/teklifler-katman-mock";
import type { TekliflerKatmanLayerSnapshot } from "@/features/teklifler/adapters/teklifler-katman-layer";

export function TeklifDetailTabs({
  tabs
}: {
  tabs: { label: string; badge?: string; active?: boolean }[];
}) {
  return (
    <nav className="tkm-hub-tabs tkm-hub-tabs--quote" aria-label="Teklif detay sekmeleri">
      {tabs.map((tab) => (
        <span
          key={tab.label}
          className={tab.active ? "tkm-hub-tab tkm-hub-tab--active" : "tkm-hub-tab"}
        >
          {tab.label}
          {tab.badge ? <span className="tkm-hub-badge">{tab.badge}</span> : null}
        </span>
      ))}
    </nav>
  );
}

export function TekliflerKatmanTabs({
  active,
  tabs
}: {
  active: KatmanTabId;
  tabs: TekliflerKatmanLayerSnapshot["tabs"];
}) {
  return (
    <nav className="tkm-tabs" aria-label="Teklif katman sekmeleri">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={active === tab.id ? "tkm-tab tkm-tab--active" : "tkm-tab"}
          aria-current={active === tab.id ? "page" : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

export function TeklifBadge({
  children,
  tone = "ok"
}: {
  children: ReactNode;
  tone?: "ok" | "warn" | "bad" | "info" | "blue";
}) {
  return <span className={`tkm-badge tkm-badge--${tone}`}>{children}</span>;
}

export function TeklifKatmanContextPanel({
  context
}: {
  context: TekliflerKatmanLayerSnapshot["context"];
}) {
  return (
    <aside className="tkm-context" aria-label="Teklif katman bağlamı">
      <header className="tkm-context-head">
        <h2>{context.title}</h2>
      </header>

      <section className="tkm-context-block">
        <h3>Teklif Bilgileri</h3>
        <dl className="tkm-dl">
          {context.teklif.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>
                {row.badge ? <TeklifBadge>{row.value}</TeklifBadge> : row.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="tkm-context-block">
        <h3>Müşteri Bilgileri</h3>
        <dl className="tkm-dl">
          {context.musteri.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="tkm-context-block">
        <h3>Teklif Özeti</h3>
        <dl className="tkm-dl tkm-dl--summary">
          {context.ozet.map((row) => (
            <div key={row.label} className={row.strong ? "tkm-dl-row--strong" : row.negative ? "tkm-dl-row--neg" : undefined}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <footer className="tkm-context-actions">
        <h3>Hızlı İşlemler</h3>
        {context.actions.map((label, i) => (
          <button
            key={label}
            type="button"
            className={
              i === 0
                ? "tkm-btn tkm-btn--primary tkm-btn--block"
                : label.includes("İptal")
                  ? "tkm-btn tkm-btn--danger tkm-btn--block"
                  : "tkm-btn tkm-btn--outline tkm-btn--block"
            }
          >
            {label}
          </button>
        ))}
      </footer>
    </aside>
  );
}

export function OzetKpiIcon({ tone }: { tone: string }) {
  return (
    <span className={`tkm-kpi-icon tkm-kpi-icon--${tone}`}>
      <KpiIcon tone={tone === "orange" ? "orange" : tone === "teal" ? "teal" : "green"} />
    </span>
  );
}

export function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
  return <span className="tkm-avatar">{initials}</span>;
}
