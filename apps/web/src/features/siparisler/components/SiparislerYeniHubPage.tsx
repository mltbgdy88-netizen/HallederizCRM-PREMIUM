"use client";

import { IconArrowRight } from "@/components/reference/icons";
import type { SiparisYeniCard } from "@/features/siparisler/data/siparisler-yeni-hub-mock";
import { useSiparislerYeniHubReferenceData } from "@/features/siparisler/hooks/use-siparisler-yeni-hub-reference-data";

function HubCardIcon({ kind }: { kind: SiparisYeniCard["icon"] }) {
  const props = {
    className: "syh-card-icon-svg",
    width: 36,
    height: 36,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    "aria-hidden": true as const
  };

  switch (kind) {
    case "quick":
      return (
        <svg {...props}>
          <circle cx="9" cy="20" r="1.5" />
          <circle cx="18" cy="20" r="1.5" />
          <path d="M3 4h2l2.4 12h11.2L21 8H7" />
          <path d="M14 4l2 4" />
        </svg>
      );
    case "quote":
      return (
        <svg {...props}>
          <path d="M7 4h10v16H7z" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </svg>
      );
    case "manual":
      return (
        <svg {...props}>
          <path d="M4 20l4-1 9-9-3-3-9 9-1 4z" />
          <path d="M14 6l3 3" />
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

export function SiparislerYeniHubPage() {
  const {
    data: { title: SYH_TITLE, subtitle: SYH_SUBTITLE, cards: SYH_CARDS, features: SYH_FEATURES }
  } = useSiparislerYeniHubReferenceData();

  return (
    <div className="syh-home">
      <div className="syh-glow syh-glow--left" aria-hidden />
      <div className="syh-glow syh-glow--right" aria-hidden />

      <header className="syh-hero">
        <h1>{SYH_TITLE}</h1>
        <p>{SYH_SUBTITLE}</p>
      </header>

      <section className="syh-cards" aria-label="Sipariş oluşturma yöntemleri">
        {SYH_CARDS.map((card) => (
          <article key={card.id} className="syh-card">
            <div className="syh-card-icon-wrap">
              <HubCardIcon kind={card.icon} />
            </div>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
            <button type="button" className="syh-card-go" aria-label={`${card.title} ile devam et`}>
              <IconArrowRight className="syh-card-go-icon" />
            </button>
          </article>
        ))}
      </section>

      <footer className="syh-features" aria-label="Özellikler">
        {SYH_FEATURES.map((feature, index) => (
          <div key={feature.id} className="syh-feature">
            {index > 0 ? <span className="syh-feature-divider" aria-hidden /> : null}
            <div className="syh-feature-copy">
              <strong>{feature.title}</strong>
              <span>{feature.subtitle}</span>
            </div>
          </div>
        ))}
      </footer>
    </div>
  );
}

