"use client";

import Link from "next/link";
import { useSistemStateReferenceData } from "@/features/sistem/hooks/use-sistem-state-reference-data";

export function UnauthorizedStatePage() {
  const {
    data: { unauthorized: UNAUTHORIZED_STATE }
  } = useSistemStateReferenceData();

  return (
    <div className="sys-unauth">
      <article className="sys-unauth-card">
        <span className="sys-unauth-icon" aria-hidden>
          <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </span>
        <h1>{UNAUTHORIZED_STATE.title}</h1>
        <p>{UNAUTHORIZED_STATE.desc}</p>
        <hr />
        <div className="sys-unauth-actions">
          <button type="button" className="sys-unauth-btn">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {UNAUTHORIZED_STATE.back}
          </button>
          <Link href="/dashboard" className="sys-unauth-btn">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z" />
            </svg>
            {UNAUTHORIZED_STATE.home}
          </Link>
        </div>
      </article>
    </div>
  );
}
