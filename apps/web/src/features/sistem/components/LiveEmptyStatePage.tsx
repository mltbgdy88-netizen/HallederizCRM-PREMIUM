"use client";

import { useSistemStateReferenceData } from "@/features/sistem/hooks/use-sistem-state-reference-data";
import { SistemStateBackdrop } from "./SistemStateBackdrop";

export function LiveEmptyStatePage() {
  const {
    data: { liveEmpty: LIVE_EMPTY }
  } = useSistemStateReferenceData();

  return (
    <div className="sys-state sys-state--empty">
      <SistemStateBackdrop />
      <div className="sys-empty-center">
        <article className="sys-empty-card">
          <span className="sys-empty-illus" aria-hidden>
            <svg width={64} height={64} viewBox="0 0 64 64" fill="none">
              <rect x="14" y="24" width="36" height="28" rx="4" fill="#d1fae5" stroke="#047857" strokeWidth={1.5} />
              <path d="M22 24V18h20v6" stroke="#047857" strokeWidth={1.5} />
              <circle cx="48" cy="16" r="10" stroke="#047857" strokeWidth={1.5} fill="#ecfdf5" />
              <path d="M44 16h8M48 12v8" stroke="#047857" strokeWidth={1.5} />
            </svg>
          </span>
          <h2>{LIVE_EMPTY.title}</h2>
          <p>{LIVE_EMPTY.desc}</p>
          <p className="sys-empty-connect">
            <span className="sys-empty-spinner" aria-hidden />
            {LIVE_EMPTY.connecting}
          </p>
        </article>
      </div>
    </div>
  );
}
