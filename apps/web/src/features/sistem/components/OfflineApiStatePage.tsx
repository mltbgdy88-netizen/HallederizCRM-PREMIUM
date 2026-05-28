"use client";

import { useSistemStateReferenceData } from "@/features/sistem/hooks/use-sistem-state-reference-data";

export function OfflineApiStatePage() {
  const {
    data: { offline: OFFLINE_STATE }
  } = useSistemStateReferenceData();

  return (
    <div className="sys-offline">
      <div className="sys-offline-center">
        <span className="sys-offline-cloud" aria-hidden>
          <svg width={88} height={64} viewBox="0 0 88 64" fill="none">
            <path
              d="M22 48h44a18 18 0 0 0-2-35.8A24 24 0 0 0 18 24a16 16 0 0 0-4 24z"
              fill="#ecfdf5"
              stroke="#047857"
              strokeWidth={2}
            />
            <path d="M58 44l10 10M52 50l16 16" stroke="#b45309" strokeWidth={2.5} strokeLinecap="round" />
            <circle cx="62" cy="52" r="8" fill="#fef3c7" stroke="#b45309" strokeWidth={1.5} />
            <path d="M59 52h6M62 49v6" stroke="#b45309" strokeWidth={1.5} />
          </svg>
        </span>
        <h1>{OFFLINE_STATE.title}</h1>
        <p>{OFFLINE_STATE.desc}</p>
        <button type="button" className="sys-offline-retry">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path d="M21 12a9 9 0 1 1-2.2-5.9M21 3v6h-6" />
          </svg>
          {OFFLINE_STATE.retry}
        </button>
        <span className="sys-offline-badge">{OFFLINE_STATE.badge}</span>
        <p className="sys-offline-note">{OFFLINE_STATE.note}</p>
      </div>
      <footer className="sys-offline-banner">
        <span>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path d="M12 3 2 20h20L12 3z" />
            <path d="M12 10v4" />
          </svg>
          {OFFLINE_STATE.banner}
        </span>
        <button type="button">{OFFLINE_STATE.bannerAction}</button>
      </footer>
    </div>
  );
}
