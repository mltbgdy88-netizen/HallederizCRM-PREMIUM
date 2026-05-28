"use client";

import type { HizliActionCard } from "@/features/hizli-islem/data/hizli-islem-mock";
import { HizliIslemActionPreviewPanel } from "@/features/hizli-islem/components/HizliIslemActionPreviewPanel";
import { useHizliIslemActionPreview } from "@/features/hizli-islem/hooks/use-hizli-islem-action-preview";
import { useHizliIslemReferenceData } from "@/features/hizli-islem/hooks/use-hizli-islem-reference-data";
import { IconArrowRight } from "@/components/reference/icons";
import { useToast } from "@/providers/toast-provider";

function ActionIcon({ kind }: { kind: HizliActionCard["icon"] }) {
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

function RecentIcon({ kind }: { kind: HizliActionCard["icon"] }) {
  return (
    <span className="hi-recent-icon-inner">
      <ActionIcon kind={kind} />
    </span>
  );
}

function statusClass(status: string): string {
  return status === "Beklemede" ? " hi-recent-badge--pending" : " hi-recent-badge--done";
}

export function HizliIslemMerkeziPage() {
  const { data, isDemo, demoBanner } = useHizliIslemReferenceData();
  const { page, actionCards, recent } = data;
  const { pushToast } = useToast();
  const {
    activeCard,
    preview,
    previewNotice,
    loading: previewLoading,
    error: previewError,
    loadPreview,
    clearPreview
  } = useHizliIslemActionPreview();

  const handleSubmitIntent = () => {
    if (!activeCard) return;
    pushToast(
      isDemo
        ? `${activeCard.title} işlemi demo modunda kaydedilmez; onay akışı için işlem ekranını kullanın.`
        : `${activeCard.title} kaydı bu ekrandan oluşturulmaz; onaylı işlem akışına yönlendirin.`
    );
  };

  return (
    <div className="hi-home">
      <header className="hi-head">
        <div className="hi-head-copy">
          <h1>{page.title}</h1>
          <p>{page.subtitle}</p>
        </div>
        <button type="button" className="hi-history-btn">
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
          {page.historyLabel}
        </button>
      </header>

      {demoBanner ? (
        <p className="hi-preview-band" role="status">
          {demoBanner}
        </p>
      ) : null}

      <section className="hi-actions" aria-label="Hızlı işlem kartları">
        {actionCards.map((card) => (
          <article
            key={card.id}
            className={activeCard?.id === card.id ? "hi-action-card hi-action-card--active" : "hi-action-card"}
          >
            <button type="button" className="hi-action-card-hit" onClick={() => void loadPreview(card)}>
              <span className="hi-action-icon-wrap">
                <ActionIcon kind={card.icon} />
              </span>
              <h2>{card.title}</h2>
              <p>{card.description}</p>
            </button>
            <button
              type="button"
              className="hi-action-go"
              aria-label={`${card.title} önizlemesini aç`}
              onClick={() => void loadPreview(card)}
            >
              <IconArrowRight className="hi-action-go-icon" />
            </button>
          </article>
        ))}
      </section>

      {activeCard ? (
        <HizliIslemActionPreviewPanel
          card={activeCard}
          preview={preview}
          notice={previewNotice}
          loading={previewLoading}
          error={previewError}
          onClose={clearPreview}
          onSubmitIntent={handleSubmitIntent}
        />
      ) : null}

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
          <button type="button" className="hi-recent-link">
            Tümünü Gör
            <IconArrowRight className="hi-recent-link-icon" />
          </button>
        </header>

        <div className="hi-recent-row">
          {recent.map((item) => (
            <article key={item.id} className="hi-recent-card">
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
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
