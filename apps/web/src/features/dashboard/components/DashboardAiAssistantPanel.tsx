"use client";

import { useState } from "react";
import { useAuth } from "../../../providers/auth-provider";
import { useToast } from "../../../providers/toast-provider";

function greetingFirstName(fullName: string | undefined): string {
  if (!fullName?.trim()) return "Ahmet";
  return fullName.trim().split(/\s+/)[0] ?? "Ahmet";
}

const AI_CHIPS_COMPACT = [
  { id: "summary", label: "Günlük özet" },
  { id: "collect", label: "Tahsilat özeti" }
];

export function DashboardAiAssistantPanel({ compact }: { compact?: boolean }) {
  const { session } = useAuth();
  const { pushToast } = useToast();
  const first = greetingFirstName(session?.user.fullName);
  const [summaryDone, setSummaryDone] = useState(false);

  if (compact) {
    return (
      <aside className="hz-ai-panel hz-ai-panel--compact" aria-label="Asistan">
        <p className="hz-ai-compact-title">Asistan</p>
        <div className="hz-ai-chips hz-ai-chips--compact" role="list">
          {AI_CHIPS_COMPACT.map((c) => {
            const isSummary = c.id === "summary";
            const done = isSummary && summaryDone;
            return (
              <button
                key={c.id}
                type="button"
                className={`hz-ai-chip hz-ai-chip--compact ${done ? "is-done" : ""}`}
                disabled={done}
                onClick={() => {
                  if (isSummary) {
                    pushToast("Gönderildi");
                    setSummaryDone(true);
                    return;
                  }
                  pushToast("İstek kuyruğa alındı");
                }}
              >
                {done ? "Özet gönderildi" : c.label}
              </button>
            );
          })}
        </div>
        <p className="hz-ai-compact-foot">
          {first}, ek özetler ilgili sayfada.
        </p>
      </aside>
    );
  }

  const AI_CHIPS = [
    { id: "summary", label: "Günlük Özeti Anlat" },
    { id: "collect", label: "Tahsilat Durumu Söyle" },
    { id: "loss", label: "Kritik carileri özetle" }
  ];

  return (
    <div className="hz-ai-panel hz-ai-panel--premium hz-ai-panel--dashboard-tone">
      <div className="hz-ai-panel-top">
        <div>
          <p className="hz-ai-panel-title">
            AI Asistan <span className="hz-ai-beta">Beta</span>
          </p>
        </div>
      </div>

      <div className="hz-ai-hero" aria-label="Asistan görüntü alanı">
        <div className="hz-ai-hero-glow" />
        <div className="hz-ai-hero-topbar">
          <span className="hz-ai-live-pill">
            <span className="hz-ai-live-dot" aria-hidden />
            Canlı
          </span>
          <div className="hz-ai-hero-spacer" />
        </div>
        <div className="hz-ai-hero-body">
          <div className="hz-ai-avatar-ring">
            <div className="hz-ai-avatar-face">{first.slice(0, 1)}</div>
          </div>
          <button type="button" className="hz-ai-hero-play" aria-label="Oynat">
            <span className="hz-ai-hero-play-triangle" aria-hidden />
          </button>
        </div>
        <div className="hz-ai-hero-chrome">
          <div className="hz-ai-hero-timeline">
            <div className="hz-ai-hero-progress" />
          </div>
          <div className="hz-ai-hero-controls">
            <button type="button" className="hz-ai-hero-ctl" aria-label="Ses aç">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
              </svg>
            </button>
            <button type="button" className="hz-ai-hero-ctl" aria-label="Genişlet">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="hz-ai-welcome">
        <p className="hz-ai-welcome-line">Merhaba {first}.</p>
        <p className="hz-ai-welcome-sub">Size nasıl yardımcı olabilirim?</p>
      </div>

      <div className="hz-ai-chips" role="list">
        {AI_CHIPS.map((c) => {
          const isSummary = c.id === "summary";
          const done = isSummary && summaryDone;
          return (
            <button
              key={c.id}
              type="button"
              className={`hz-ai-chip ${done ? "is-done" : ""}`}
              disabled={done}
              onClick={() => {
                if (isSummary) {
                  pushToast("Gönderildi");
                  setSummaryDone(true);
                  return;
                }
                pushToast("İstek kuyruğa alındı");
              }}
            >
              {done ? "Günlük özeti gönderildi" : c.label}
            </button>
          );
        })}
      </div>

      <div className="hz-ai-thread" aria-label="Sohbet">
        <div className="hz-ai-bubble hz-ai-bubble--ai">
          <p>Bugün tahsilat akışında 3 kritik cari var. Özetlememi ister misiniz?</p>
        </div>
        <div className="hz-ai-bubble hz-ai-bubble--user">
          <p>Kısa özet yeter.</p>
        </div>
      </div>

      <div className="hz-ai-voice-panel">
        <div className="hz-ai-voice-head">
          <span className="hz-ai-voice-title">Sesli Konuşma</span>
          <button type="button" className="hz-ai-voice-close" aria-label="Kapat">
            ×
          </button>
        </div>
        <div className="hz-ai-wave" aria-hidden>
          {Array.from({ length: 16 }).map((_, i) => (
            <span key={i} className="hz-ai-wave-bar" style={{ height: `${6 + ((i * 5) % 12)}px` }} />
          ))}
        </div>
        <div className="hz-ai-voice-actions">
          <button type="button" className="hz-ai-mic" aria-label="Mikrofon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3z" />
              <path d="M19 10v1a7 7 0 01-14 0v-1M12 18v4M8 22h8" />
            </svg>
          </button>
          <input type="text" className="hz-ai-voice-input" readOnly placeholder="Mesajınızı yazın veya konuşun…" />
        </div>
      </div>
    </div>
  );
}
