"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import { getDashboardHomeSnapshot } from "../../dashboard/queries/get-dashboard-home-snapshot";
import { getDashboardLiveSnapshot } from "../../dashboard/queries/get-dashboard-live-snapshot";
import { EMPTY_DASHBOARD_HOME_SNAPSHOT, type DashboardHomeSnapshot } from "../../dashboard/utils/build-dashboard-home-snapshot";
import {
  QUICK_OPERATION_HUB_CARDS,
  QUICK_OPERATION_HUB_PAGE,
  type QuickOperationHubIcon
} from "../data/quick-operation-hub-data";
import { mapSnapshotToHubRecent, type QuickOperationRecentItem } from "../data/quick-operation-recent-data";
import { IconArrowRight } from "../../dashboard/components/dashboard-reference-icons";

function ActionIcon({ kind }: { kind: QuickOperationHubIcon }) {
  const props = {
    className: "hi-action-icon-svg",
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    "aria-hidden": true as const
  };

  switch (kind) {
    case "order":
      return (
        <svg {...props}>
          <path d="M7 4h10v16H7z" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </svg>
      );
    case "offer":
      return (
        <svg {...props}>
          <path d="M7 4h10v16H7z" />
          <path d="M9 8h6M9 12h4" />
          <path d="M14 16h2" />
          <path d="M12 14v4M11 17h2" />
        </svg>
      );
    case "collection":
      return (
        <svg {...props}>
          <path d="M4 7h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
          <path d="M18 12h2" />
        </svg>
      );
    case "delivery":
      return (
        <svg {...props}>
          <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7V10z" />
          <circle cx="7" cy="17" r="2" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      );
    case "return":
      return (
        <svg {...props}>
          <path d="M12 3 3 7.5 12 12l9-4.5L12 3z" />
          <path d="M7 14h11M10 17l-3-3 3-3M17 10H6" />
        </svg>
      );
    case "impact":
      return (
        <svg {...props}>
          <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
          <path d="M12 12V6M12 12l4 2" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}

function RecentIcon({ kind }: { kind: QuickOperationHubIcon }) {
  return (
    <span className="hi-recent-icon-inner">
      <ActionIcon kind={kind} />
    </span>
  );
}

function statusClass(status: string): string {
  return status === "Beklemede" ? " hi-recent-badge--pending" : " hi-recent-badge--done";
}

export function QuickOperationHubReferenceLayout() {
  const isDemo = dataSourceConfig.useDemoData;
  const [snapshot, setSnapshot] = useState<DashboardHomeSnapshot>(EMPTY_DASHBOARD_HOME_SNAPSHOT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      try {
        const loader = isDemo ? getDashboardHomeSnapshot() : getDashboardLiveSnapshot();
        const snap = await loader;
        if (!active) return;
        setSnapshot(snap);
      } catch {
        if (!active) return;
        setSnapshot(EMPTY_DASHBOARD_HOME_SNAPSHOT);
      } finally {
        if (active) setLoading(false);
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, [isDemo]);

  const recentItems = useMemo(() => mapSnapshotToHubRecent(snapshot, 5), [snapshot]);

  return (
    <div className="hi-home hi-home--embedded" data-page="quick-operation-hub">
      <header className="hi-head">
        <div className="hi-head-copy">
          <h1>{QUICK_OPERATION_HUB_PAGE.title}</h1>
          <p>{QUICK_OPERATION_HUB_PAGE.subtitle}</p>
        </div>
        <Link href={QUICK_OPERATION_HUB_PAGE.historyHref} className="hi-history-btn">
          <svg
            className="hi-history-btn-icon"
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            aria-hidden
          >
            <circle cx="12" cy="12" r="8" />
            <path d="M12 8v4l3 2" />
            <path d="M16 4l2-2M20 8h3" />
          </svg>
          {QUICK_OPERATION_HUB_PAGE.historyLabel}
        </Link>
      </header>

      <section className="hi-actions" aria-label="Hızlı işlem kartları">
        {QUICK_OPERATION_HUB_CARDS.map((card) => (
          <article key={card.id} className="hi-action-card">
            <span className="hi-action-icon-wrap">
              <ActionIcon kind={card.icon} />
            </span>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
            <Link href={card.href} className="hi-action-go" aria-label={`${card.title} işlemine git`}>
              <IconArrowRight className="hi-action-go-icon" />
            </Link>
          </article>
        ))}
      </section>

      <section className="hi-recent-panel" aria-label="Son işlemler">
        <header className="hi-recent-head">
          <h2>
            <svg
              className="hi-recent-head-icon"
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden
            >
              <circle cx="12" cy="12" r="8" />
              <path d="M12 8v4l3 2" />
            </svg>
            Son İşlemler
          </h2>
          <Link href="/archive" className="hi-recent-link">
            Tümünü Gör
            <IconArrowRight className="hi-recent-link-icon" />
          </Link>
        </header>

        <div className="hi-recent-row">
          {loading ? (
            <article className="hi-recent-card hi-recent-card--placeholder">
              <div className="hi-recent-body">
                <strong>Yükleniyor…</strong>
                <span className="hi-recent-customer">Son işlemler hazırlanıyor.</span>
              </div>
            </article>
          ) : null}
          {!loading && recentItems.length === 0 ? (
            <article className="hi-recent-card hi-recent-card--placeholder">
              <div className="hi-recent-body">
                <strong>Henüz kayıt yok</strong>
                <span className="hi-recent-customer">İşlem kaydı oluşturduğunuzda burada görünür.</span>
              </div>
            </article>
          ) : null}
          {recentItems.map((item: QuickOperationRecentItem) => (
            <Link key={item.id} href={item.href} className="hi-recent-card hi-recent-card-link">
              <span className={`hi-recent-icon hi-recent-icon--${item.iconTone}`}>
                <RecentIcon kind={item.icon} />
              </span>
              <div className="hi-recent-body">
                <strong>{item.type}</strong>
                <span className="hi-recent-ref">{item.ref}</span>
                <span className="hi-recent-customer">{item.customer}</span>
                <span className="hi-recent-time">{item.timeAgo}</span>
              </div>
              <span className={`hi-recent-badge${statusClass(item.status)}`}>{item.status}</span>
            </Link>
          ))}
        </div>
      </section>

      {isDemo ? (
        <p className="hi-mode" role="status">
          Demo veri: son işlemler dashboard snapshot aktivitesinden beslenir.
        </p>
      ) : (
        <p className="hi-mode" role="status">
          Canlı özet bağlı. Kritik kayıtlar onay zincirinden geçer.
        </p>
      )}
    </div>
  );
}
