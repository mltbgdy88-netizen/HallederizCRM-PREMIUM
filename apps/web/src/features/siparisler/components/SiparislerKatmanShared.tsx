"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { KpiIcon } from "@/components/reference/icons";
import type { SkmTabId } from "@/features/siparisler/data/siparisler-katman-mock";
import type { SiparislerKatmanLayerSnapshot } from "@/features/siparisler/adapters/siparisler-katman-layer";

export function SiparisBadge({
  children,
  tone = "ok"
}: {
  children: ReactNode;
  tone?: "ok" | "warn" | "bad" | "info";
}) {
  return <span className={`skm-badge skm-badge--${tone}`}>{children}</span>;
}

export function SiparislerKatmanTabs({
  active,
  tabs
}: {
  active: SkmTabId;
  tabs: SiparislerKatmanLayerSnapshot["tabs"];
}) {
  return (
    <nav className="skm-tabs" aria-label="Sipariş katman sekmeleri">
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          href={tab.href}
          className={tab.id === active ? "skm-tab skm-tab--active" : "skm-tab"}
          aria-current={tab.id === active ? "page" : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

export function SiparisKatmanBreadcrumbHead({
  breadcrumb,
  orderId,
  status,
  meta,
  actions
}: {
  breadcrumb: readonly string[];
  orderId: string;
  status: string;
  meta: string;
  actions?: ReactNode;
}) {
  return (
    <header className="skm-layer-head">
      <nav className="skm-breadcrumb" aria-label="Konum">
        {breadcrumb.map((part, i) => (
          <span key={part}>
            {i > 0 ? <span className="skm-breadcrumb-sep">›</span> : null}
            <span className={i === breadcrumb.length - 1 ? "skm-breadcrumb-current" : undefined}>{part}</span>
          </span>
        ))}
      </nav>
      <div className="skm-layer-head-main">
        <div>
          <div className="skm-order-id-row">
            <h1>
              Sipariş <span>{orderId}</span>
            </h1>
            <SiparisBadge>{status}</SiparisBadge>
          </div>
          <p className="skm-layer-meta">{meta}</p>
        </div>
        {actions ? <div className="skm-head-actions">{actions}</div> : null}
      </div>
    </header>
  );
}

export function SiparisKatmanHeader() {
  return <SiparisKatmanHeaderWithData />;
}

export function SiparisKatmanHeaderWithData({
  header
}: {
  header?: {
    orderId: string;
    orderDate: string;
    status: string;
    customer: string;
    customerBadge?: string;
    customerCode?: string;
    email?: string;
    phone?: string;
    rep?: string;
    repRole?: string;
    priceList?: string;
    priceListCode?: string;
    currency: string;
  };
}) {
  if (!header) return null;
  const h = header;
  return (
    <header className="skm-order-head">
      <div className="skm-order-head-main">
        <div className="skm-order-id-row">
          <h1>
            Sipariş <span>{h.orderId}</span>
          </h1>
          <button type="button" className="skm-copy" aria-label="Sipariş numarasını kopyala">
            ⧉
          </button>
          <SiparisBadge>{h.status}</SiparisBadge>
        </div>
        <p className="skm-order-date">{h.orderDate}</p>
      </div>
      <div className="skm-head-actions">
        <button type="button" className="skm-btn skm-btn--primary">
          + Yeni Sipariş
        </button>
        <button type="button" className="skm-btn skm-btn--outline">
          Düzenle
        </button>
        <button type="button" className="skm-btn skm-btn--outline">
          Diğer İşlemler ▾
        </button>
      </div>
    </header>
  );
}

export function SiparisEntityCards() {
  return <SiparisEntityCardsWithData />;
}

export function SiparisEntityCardsWithData({
  header
}: {
  header?: {
    customer: string;
    customerBadge?: string;
    customerCode?: string;
    email?: string;
    phone?: string;
    rep?: string;
    repRole?: string;
    priceList?: string;
    priceListCode?: string;
    currency: string;
  };
}) {
  if (!header) return null;
  const h = header;
  const cards = [
    {
      title: "Müşteri",
      main: h.customer,
      badge: h.customerBadge,
      lines: [`${h.customerCode ?? ""}`.trim(), h.email ?? "", h.phone ?? ""].filter(Boolean)
    },
    {
      title: "Müşteri Temsilcisi",
      main: h.rep ?? "—",
      lines: [h.repRole ?? "—"]
    },
    {
      title: "Fiyat Listesi",
      main: h.priceList ?? "—",
      lines: [h.priceListCode ?? "—"]
    },
    {
      title: "Para Birimi",
      main: h.currency,
      lines: [] as string[]
    }
  ];

  return (
    <section className="skm-entity-row" aria-label="Sipariş üst kartları">
      {cards.map((card) => (
        <article key={card.title} className="skm-entity-card">
          <span className="skm-entity-label">{card.title}</span>
          <strong>{card.main}</strong>
          {card.badge ? <SiparisBadge tone="info">{card.badge}</SiparisBadge> : null}
          {card.lines.map((line) => (
            <span key={line} className="skm-entity-line">
              {line}
            </span>
          ))}
        </article>
      ))}
    </section>
  );
}

export function SiparisKatmanContextPanel({
  context
}: {
  context: SiparislerKatmanLayerSnapshot["context"];
}) {
  return (
    <aside className="skm-context" aria-label="Sipariş katman bağlamı">
      <header className="skm-context-head">
        <h2>{context.title}</h2>
      </header>

      <section className="skm-context-block">
        <div className="skm-context-limit">
          <span>Müşteri Durumu</span>
          <SiparisBadge>{context.customerStatus}</SiparisBadge>
        </div>
        <dl className="skm-dl">
          <div>
            <dt>Müşteri Limiti</dt>
            <dd>{context.limit}</dd>
          </div>
          <div>
            <dt>Kalan Limit</dt>
            <dd>{context.remainingLimit}</dd>
          </div>
          <div className="skm-dl-row--neg">
            <dt>Vadesi Geçmiş</dt>
            <dd>{context.overdue}</dd>
          </div>
        </dl>
      </section>

      <section className="skm-context-block">
        <h3>Sipariş Bilgileri</h3>
        <dl className="skm-dl skm-dl--summary">
          {context.stats.map((row) => (
            <div key={row.label} className={"warn" in row && row.warn ? "skm-dl-row--warn" : undefined}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="skm-context-block">
        <h3>Hızlı İşlemler</h3>
        <div className="skm-context-actions">
          {context.actions.map((label, i) => (
            <button
              key={label}
              type="button"
              className={i === 0 ? "skm-btn skm-btn--primary skm-btn--block" : "skm-btn skm-btn--outline skm-btn--block"}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="skm-context-block skm-notes">
        <div className="skm-notes-head">
          <h3>Notlar</h3>
          <button type="button" className="skm-btn skm-btn--outline skm-btn--sm">
            +
          </button>
        </div>
        <p>{context.note}</p>
        <span className="skm-notes-meta">{context.noteAuthor}</span>
      </section>
    </aside>
  );
}

export function SkmKpiIcon({ tone }: { tone: string }) {
  const map: Record<string, "green" | "teal" | "orange" | "gold" | "blue"> = {
    green: "green",
    teal: "teal",
    orange: "orange",
    gold: "gold",
    blue: "blue"
  };
  return (
    <span className={`skm-kpi-icon skm-kpi-icon--${tone}`}>
      <KpiIcon tone={map[tone] ?? "green"} />
    </span>
  );
}

