// @ts-nocheck
"use client";

import { LucideIcon } from "./icons/lucide-icons";

export function DashboardHeaderCardsButton() {
  return (
    <button
      type="button"
      className="hz-header-cc-cards"
      onClick={() => window.dispatchEvent(new CustomEvent("dashboard:open-card-editor"))}
    >
      <span className="hz-header-cc-cards-icon" aria-hidden>
        <LucideIcon name="grid-3x3" size={15} strokeWidth={2.25} />
      </span>
      Paneller
    </button>
  );
}

