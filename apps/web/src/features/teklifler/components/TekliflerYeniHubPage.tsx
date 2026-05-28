"use client";

import { useState } from "react";
import { TYH_OPTIONS as TYH_OPTIONS_REF } from "@/features/teklifler/data/teklifler-yeni-mock";
import { useTekliflerYeniReferenceData } from "@/features/teklifler/hooks/use-teklifler-yeni-reference-data";
import { IconArrowRight } from "@/components/reference/icons";

function HubOptionIcon({ icon }: { icon: (typeof TYH_OPTIONS_REF)[number]["icon"] }) {
  const props = {
    className: "tyh-option-icon-svg",
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    "aria-hidden": true as const
  };
  if (icon === "bolt") {
    return (
      <svg {...props}>
        <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M7 4h10v16H7z" />
      <path d="M9 8h6M9 12h4" />
      <path d="M14 16h2" />
    </svg>
  );
}

export function TekliflerYeniHubPage() {
  const {
    data: {
      page: TYH_PAGE,
      hub: TYH_HUB,
      options: TYH_OPTIONS,
      drafts: TYH_DRAFTS,
      tip: TYH_TIP
    }
  } = useTekliflerYeniReferenceData();

  const [tipVisible, setTipVisible] = useState(true);

  return (
    <div className="tyh-home">
      <header className="tyh-head">
        <div className="tyh-head-copy">
          <nav className="tyh-crumb" aria-label="Konum">
            {TYH_PAGE.breadcrumb.map((part, i) => (
              <span key={part}>
                {i > 0 ? <span className="tyh-crumb-sep">›</span> : null}
                <span className={i === TYH_PAGE.breadcrumb.length - 1 ? "tyh-crumb-current" : ""}>
                  {part}
                </span>
              </span>
            ))}
          </nav>
          <h1>{TYH_PAGE.title}</h1>
          <p>{TYH_PAGE.subtitle}</p>
        </div>
        <a href="#" className="tyh-list-btn">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {TYH_PAGE.listButton}
        </a>
      </header>

      <div className="tyh-main">
        <section className="tyh-hub" aria-labelledby="tyh-hub-title">
          <span className="tyh-hub-mark" aria-hidden>
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M7 4h10v16H7z" />
              <path d="M9 8h6M9 12h4" />
              <path d="M12 14v4M11 17h2" />
            </svg>
          </span>
          <h2 id="tyh-hub-title">{TYH_HUB.title}</h2>
          <p className="tyh-hub-sub">{TYH_HUB.subtitle}</p>
          <div className="tyh-options">
            {TYH_OPTIONS.map((opt) => (
              <button key={opt.id} type="button" className="tyh-option-card">
                <span className="tyh-option-icon-wrap">
                  <HubOptionIcon icon={opt.icon} />
                </span>
                <div className="tyh-option-copy">
                  <h3>{opt.title}</h3>
                  <p>{opt.description}</p>
                </div>
                <span className="tyh-option-go" aria-hidden>
                  <IconArrowRight className="tyh-option-go-icon" />
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="tyh-drafts" aria-labelledby="tyh-drafts-title">
          <div className="tyh-drafts-head">
            <div className="tyh-drafts-title-wrap">
              <span className="tyh-drafts-icon" aria-hidden>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M7 4h10v16H7z" />
                  <path d="M9 8h6M9 12h4" />
                </svg>
              </span>
              <h2 id="tyh-drafts-title">Son Taslak Teklifler</h2>
            </div>
            <button type="button" className="tyh-see-all">
              Tümünü Gör
            </button>
          </div>
          <div className="tyh-draft-row">
            {TYH_DRAFTS.map((draft) => (
              <article key={draft.id} className="tyh-draft-card">
                <span className="tyh-draft-doc" aria-hidden>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M7 4h10v16H7z" />
                    <path d="M9 8h6M9 12h4" />
                  </svg>
                </span>
                <div className="tyh-draft-body">
                  <p className="tyh-draft-code">{draft.code}</p>
                  <p className="tyh-draft-customer">{draft.customer}</p>
                  <p className="tyh-draft-meta">
                    <span>{draft.datetime}</span>
                    <span className="tyh-draft-amount">{draft.amount}</span>
                  </p>
                </div>
                <span className="tyh-draft-badge">Taslak</span>
                <button type="button" className="tyh-draft-menu" aria-label="Taslak menüsü">
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <circle cx="12" cy="6" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="18" r="1.5" />
                  </svg>
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>

      {tipVisible ? (
        <aside className="tyh-tip" role="note">
          <span className="tyh-tip-icon" aria-hidden>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
            </svg>
          </span>
          <p>{TYH_TIP}</p>
          <button type="button" className="tyh-tip-close" aria-label="İpucunu kapat" onClick={() => setTipVisible(false)}>
            ×
          </button>
        </aside>
      ) : null}
    </div>
  );
}
