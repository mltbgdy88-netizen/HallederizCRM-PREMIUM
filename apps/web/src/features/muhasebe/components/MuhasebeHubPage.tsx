"use client";

import Link from "next/link";
import type { MuhasebeHubCard } from "@/features/muhasebe/data/muhasebe-hub-mock";
import {
  MUHASEBE_HUB_CARDS,
  MUHASEBE_HUB_SUBTITLE,
  MUHASEBE_HUB_TITLE
} from "@/features/muhasebe/data/muhasebe-hub-mock";

function HubIcon({ icon }: { icon: MuhasebeHubCard["icon"] }) {
  const props = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    "aria-hidden": true as const
  };
  if (icon === "payments") {
    return (
      <svg {...props}>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18M7 15h.01M11 15h2" />
      </svg>
    );
  }
  if (icon === "returns") {
    return (
      <svg {...props}>
        <path d="M3 7v6h6" />
        <path d="M21 17a8 8 0 0 0-14-5.3L3 13" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

export function MuhasebeHubPage() {
  return (
    <div className="ahb-home">
      <header className="ahb-head">
        <h1>{MUHASEBE_HUB_TITLE}</h1>
        <p>{MUHASEBE_HUB_SUBTITLE}</p>
      </header>
      <div className="ahb-grid">
        {MUHASEBE_HUB_CARDS.map((card) => (
          <Link key={card.id} href={card.href} className="ahb-card">
            <span className="ahb-card-icon" aria-hidden>
              <HubIcon icon={card.icon} />
            </span>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
            <span className="ahb-card-arrow" aria-hidden>
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
