"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { KpiIcon } from "@/components/reference/icons";
import type { CarilerKatmanReferenceSnapshot } from "@/features/cariler/adapters/cariler-katman-reference-adapter";
import type { CkmHeaderData, CkmTabId, CkmTabStripItem } from "@/features/cariler/data/cariler-katman-mock";

export function CkmBadge({
  children,
  tone = "ok"
}: {
  children: ReactNode;
  tone?: "ok" | "warn" | "bad" | "info" | "blue" | "neutral" | "purple" | "orange" | "green";
}) {
  const resolved = tone === "green" ? "ok" : tone === "orange" ? "warn" : tone;
  return <span className={`ckm-badge ckm-badge--${resolved}`}>{children}</span>;
}

export function CarilerKatmanTabs({ active, tabs }: { active: CkmTabId; tabs: CkmTabStripItem[] }) {
  const strip = tabs;
  return (
    <nav className="ckm-tabs" aria-label="Cari katman sekmeleri">
      {strip.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={active === tab.id ? "ckm-tab ckm-tab--active" : "ckm-tab"}
          aria-current={active === tab.id ? "page" : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

export function CarilerKatmanHero({
  header,
  onEdit,
  onMore
}: {
  header: CkmHeaderData;
  onEdit?: () => void;
  onMore?: () => void;
}) {
  const data = header;
  return (
    <header className="ckm-hero" aria-label="Cari üst bilgi">
      <nav className="ckm-breadcrumb" aria-label="Breadcrumb">
        {data.breadcrumb.map((part, i) => (
          <span key={part}>
            {i > 0 ? <span className="ckm-breadcrumb-sep">›</span> : null}
            {part}
          </span>
        ))}
      </nav>
      <div className="ckm-hero-body">
        <span className="ckm-logo">{data.initials}</span>
        <div className="ckm-hero-main">
          <div className="ckm-hero-title-row">
            <h1>{data.title}</h1>
            <CkmBadge>{data.status}</CkmBadge>
          </div>
          <div className="ckm-hero-grid">
            <dl className="ckm-hero-meta">
              {data.meta.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
            <dl className="ckm-hero-meta">
              {data.contact.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="ckm-hero-actions">
          <button type="button" className="ckm-btn ckm-btn--outline" onClick={onEdit}>
            Düzenle
          </button>
          <button type="button" className="ckm-btn ckm-btn--outline" aria-label="Diğer işlemler" onClick={onMore}>
            ⋮
          </button>
        </div>
      </div>
    </header>
  );
}

export function CarilerKatmanContextPanel({
  context,
  onShortcut
}: {
  context?: CarilerKatmanReferenceSnapshot["context"];
  onShortcut?: (label: string) => void;
}) {
  const panel = context ?? {
    title: "Cari Katman Bağlamı",
    cari: [],
    finans: [],
    hareketler: [],
    shortcuts: []
  };

  return (
    <aside className="ckm-context" aria-label="Cari katman bağlamı">
      <header className="ckm-context-head">
        <h2>{panel.title}</h2>
      </header>

      <section className="ckm-context-block">
        <h3>Cari Bilgileri</h3>
        <dl className="ckm-dl">
          {panel.cari.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>
                {"badge" in row ? <CkmBadge>{row.value}</CkmBadge> : row.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="ckm-context-block">
        <h3>Finansal Durum</h3>
        <dl className="ckm-dl">
          {panel.finans.map((row) => (
            <div
              key={row.label}
              className={
                "negative" in row && row.negative
                  ? "ckm-dl-row--neg"
                  : "warn" in row && row.warn
                    ? "ckm-dl-row--warn"
                    : undefined
              }
            >
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="ckm-context-block">
        <h3>Son Hareketler</h3>
        <ul className="ckm-move-list">
          {panel.hareketler.map((item) => (
            <li key={`${item.type}-${item.date}`}>
              <span className={`ckm-move-icon ckm-move-icon--${item.type}`} aria-hidden />
              <div>
                <strong>{item.title}</strong>
                <span>
                  {item.date} · {item.amount}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <footer className="ckm-context-actions">
        <h3>Kısayollar</h3>
        {panel.shortcuts.map((label, i) => (
          <button
            key={label}
            type="button"
            className={i === 0 ? "ckm-btn ckm-btn--primary ckm-btn--block" : "ckm-btn ckm-btn--outline ckm-btn--block"}
            onClick={() => onShortcut?.(label)}
          >
            {label}
          </button>
        ))}
      </footer>
    </aside>
  );
}

export function CkmKpiIcon({ tone }: { tone: string }) {
  const map: Record<string, "green" | "teal" | "orange"> = {
    green: "green",
    teal: "teal",
    orange: "orange",
    blue: "teal",
    purple: "green"
  };
  return (
    <span className={`ckm-kpi-icon ckm-kpi-icon--${tone}`}>
      <KpiIcon tone={map[tone] ?? "green"} />
    </span>
  );
}

export function CkmPersonAvatar({ initials }: { initials: string }) {
  return <span className="ckm-person-avatar">{initials}</span>;
}

