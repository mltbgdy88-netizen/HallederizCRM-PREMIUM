// @ts-nocheck
"use client";

import { LucideIcon } from "../../../components/icons/lucide-icons";

type ApprovalCommandIntroProps = {
  onRefresh: () => void;
  refreshing: boolean;
  onSearchFocus?: () => void;
};

export function ApprovalCommandIntro({ onRefresh, refreshing, onSearchFocus }: ApprovalCommandIntroProps) {
  return (
    <header className="hz-approval-intro">
      <div className="hz-approval-intro__left">
        <span className="hz-approval-intro__icon" aria-hidden>
          <LucideIcon name="shield-check" size={16} />
        </span>
        <div>
          <h1 className="hz-approval-intro__title">Onaylar</h1>
          <p className="hz-approval-intro__subtitle">AI, otomasyon ve mesaj kaynaklı öneriler burada incelenir.</p>
        </div>
      </div>
      <div className="hz-approval-intro__actions">
        <button
          type="button"
          className="hz-approval-icon-btn"
          aria-label="Arama alanına git"
          title="Ara"
          onClick={onSearchFocus}
        >
          <LucideIcon name="search" size={15} />
        </button>
        <button
          type="button"
          className="hz-approval-refresh-btn"
          disabled={refreshing}
          onClick={onRefresh}
        >
          <LucideIcon name="rotate-ccw" size={14} />
          Yenile
        </button>
      </div>
    </header>
  );
}


