"use client";

import { useState } from "react";
import { IconChevronDown, IconInfo } from "@/components/reference/icons";
import { useOnaylarReferenceData } from "@/features/onaylar/hooks/use-onaylar-reference-data";
import type { OkmKpi, OkmPendingItem } from "@/features/onaylar/data/onaylar-komut-masasi-mock";

function OkmKpiIcon({ icon }: { icon: OkmKpi["icon"] }) {
  const props = {
    className: "okm-kpi-icon-svg",
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    "aria-hidden": true as const
  };
  switch (icon) {
    case "hourglass":
      return (
        <svg {...props}>
          <path d="M6 2h12M6 22h12M8 6h8l-4 6 4 6H8l4-6-4-6z" />
        </svg>
      );
    case "cart":
      return (
        <svg {...props}>
          <circle cx="9" cy="20" r="1" />
          <circle cx="18" cy="20" r="1" />
          <path d="M2 3h2l2.4 12.4a2 2 0 0 0 2 1.6h9.2a2 2 0 0 0 2-1.6L22 7H6" />
        </svg>
      );
    case "user":
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="4" />
          <path d="M5 20c1.5-4 4.5-6 7-6s5.5 2 7 6" />
        </svg>
      );
    case "document":
      return (
        <svg {...props}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
          <path d="M14 3v5h5" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
  }
}

function PendingIcon({ icon }: { icon: OkmPendingItem["icon"] }) {
  const props = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    "aria-hidden": true as const
  };
  if (icon === "customer") {
    return (
      <svg {...props}>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 20c1.5-4 4.5-6 7-6s5.5 2 7 6" />
      </svg>
    );
  }
  if (icon === "document") {
    return (
      <svg {...props}>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
        <path d="M14 3v5h5" />
      </svg>
    );
  }
  if (icon === "finance") {
    return (
      <svg {...props}>
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
}

function PendingCard({
  item,
  selected,
  onSelect
}: {
  item: OkmPendingItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={selected ? "okm-pending-card okm-pending-card--selected" : "okm-pending-card"}
      onClick={onSelect}
    >
      <span className="okm-pending-icon" aria-hidden>
        <PendingIcon icon={item.icon} />
      </span>
      <span className="okm-pending-body">
        <strong>{item.title}</strong>
        <span className="okm-pending-ref">{item.ref}</span>
        <span className="okm-pending-meta">{item.requester}</span>
        <span className="okm-pending-time">{item.dateTime}</span>
      </span>
      <span className="okm-badge okm-badge--pending">{item.status}</span>
    </button>
  );
}

export function OnaylarKomutMasasiPage() {
  const { page, kpis, pending, pagination, actions, getDetailForId } = useOnaylarReferenceData();
  const [selectedId, setSelectedId] = useState(pending[0]?.id ?? "1");
  const [historyOpen, setHistoryOpen] = useState(true);
  const detail = getDetailForId(selectedId);
  const selectedItem = pending.find((p) => p.id === selectedId) ?? pending[0]!;

  return (
    <div className="okm-home">
      <header className="okm-top">
        <div className="okm-head">
          <h1>{page.title}</h1>
          <p>{page.subtitle}</p>
        </div>
        <button type="button" className="okm-btn okm-btn--ghost">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          {page.historyBtn}
        </button>
      </header>

      <section className="okm-kpi-row" aria-label="Onay özetleri">
        {kpis.map((kpi) => (
          <article key={kpi.id} className={`okm-kpi-card okm-kpi-card--${kpi.tone}`}>
            <div className={`okm-kpi-icon okm-kpi-icon--${kpi.tone}`}>
              <OkmKpiIcon icon={kpi.icon} />
            </div>
            <div className="okm-kpi-body">
              <span className="okm-kpi-value">{kpi.value}</span>
              <span className="okm-kpi-label">{kpi.label}</span>
            </div>
            <button type="button" className="okm-kpi-info" aria-label={`${kpi.label} bilgisi`}>
              <IconInfo className="okm-kpi-info-icon" />
            </button>
          </article>
        ))}
      </section>

      <section className="okm-body" aria-label="Onay listesi ve detay">
        <aside className="okm-list-panel" aria-label="Bekleyen onaylar">
          <header className="okm-list-head">
            <h2>Bekleyen Onaylar (7)</h2>
            <button type="button" className="okm-btn okm-btn--filter">
              Filtrele
              <IconChevronDown className="okm-filter-chevron" />
            </button>
          </header>
          <div className="okm-list-scroll">
            {pending.map((item) => (
              <PendingCard
                key={item.id}
                item={item}
                selected={item.id === selectedId}
                onSelect={() => setSelectedId(item.id)}
              />
            ))}
          </div>
          <footer className="okm-list-foot">
            <span>{pagination.totalLabel}</span>
            <div className="okm-list-foot-right">
              <button type="button" className="okm-page-size">
                {pagination.pageSize}
                <IconChevronDown className="okm-filter-chevron" />
              </button>
              <nav className="okm-pager" aria-label="Sayfalama">
                <button type="button" className="okm-pager-num okm-pager-num--active">
                  {pagination.page}
                </button>
              </nav>
            </div>
          </footer>
        </aside>

        <article className="okm-detail-panel" aria-label="Onay detayı">
          <header className="okm-detail-head">
            <div className="okm-detail-title-row">
              <span className="okm-detail-icon" aria-hidden>
                <PendingIcon icon={selectedItem.icon} />
              </span>
              <div>
                <h2>{detail.title}</h2>
                <div className="okm-detail-sub">
                  <span>{detail.ref}</span>
                  <span className="okm-detail-dot" aria-hidden>
                    ·
                  </span>
                  <span>{detail.dateTime}</span>
                </div>
              </div>
            </div>
            <span className="okm-priority">{detail.priority}</span>
          </header>

          <div className="okm-detail-scroll">
            <div className="okm-info-grid okm-info-grid--2">
              <div>
                <span className="okm-field-label">{detail.requesterLabel}</span>
                <strong>{detail.requester}</strong>
                <span className="okm-field-sub">{detail.requesterRole}</span>
              </div>
              <div>
                <span className="okm-field-label">{detail.departmentLabel}</span>
                <strong>{detail.department}</strong>
              </div>
            </div>

            <p className="okm-description">{detail.description}</p>

            <section className="okm-block">
              <h3>{detail.productTitle}</h3>
              <div className="okm-fields-grid">
                {detail.productFields.map((f) => (
                  <div key={f.label} className="okm-field">
                    <span className="okm-field-label">{f.label}</span>
                    <strong>{f.value}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="okm-block">
              <h3>{detail.extraTitle}</h3>
              <div className="okm-fields-grid">
                {detail.extraFields.map((f) => (
                  <div key={f.label} className="okm-field">
                    <span className="okm-field-label">{f.label}</span>
                    <strong>{f.value}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="okm-block okm-block--history">
              <button
                type="button"
                className="okm-history-toggle"
                onClick={() => setHistoryOpen((v) => !v)}
                aria-expanded={historyOpen}
              >
                <h3>{detail.historyTitle}</h3>
                <IconChevronDown className={historyOpen ? "okm-chevron okm-chevron--open" : "okm-chevron"} />
              </button>
              {historyOpen ? (
                <ul className="okm-history">
                  {detail.history.map((h) => (
                    <li key={h.id}>
                      <span className="okm-history-dot" aria-hidden />
                      <div>
                        <strong>{h.title}</strong>
                        <p>{h.detail}</p>
                        <span className="okm-history-time">{h.time}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          </div>
        </article>

        <aside className="okm-actions-panel" aria-label="Onay işlemleri">
          <section className="okm-actions-block">
            <h2>{actions.title}</h2>
            <p className="okm-actions-info">{actions.info}</p>
            <div className="okm-action-btns">
              <button type="button" className="okm-action-btn okm-action-btn--approve">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M5 12l5 5L20 7" />
                </svg>
                {actions.approve}
              </button>
              <button type="button" className="okm-action-btn okm-action-btn--reject">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
                {actions.reject}
              </button>
              <button type="button" className="okm-action-btn okm-action-btn--review">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
                {actions.review}
              </button>
            </div>
          </section>

          <section className="okm-meta-block">
            <h2>{actions.metaTitle}</h2>
            <dl className="okm-meta-list">
              {actions.meta.map((row) => (
                <div key={row.label} className="okm-meta-row">
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
            <label className="okm-comment">
              <span>{actions.commentLabel}</span>
              <textarea readOnly placeholder={actions.commentPlaceholder} rows={3} />
            </label>
            <label className="okm-notify">
              <input type="checkbox" defaultChecked readOnly />
              <span>{actions.notifyLabel}</span>
            </label>
          </section>
        </aside>
      </section>
    </div>
  );
}

