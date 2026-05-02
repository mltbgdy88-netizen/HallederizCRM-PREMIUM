"use client";

export function DashboardAiAssistantPanel() {
  return (
    <div className="hz-ai-panel">
      <div className="hz-ai-video-frame" aria-label="Asistan önizleme alanı">
        <div className="hz-ai-video-chrome">
          <button type="button" className="hz-ai-video-play" aria-label="Oynat">
            <span className="hz-ai-video-play-icon" aria-hidden />
          </button>
          <div className="hz-ai-video-timeline">
            <div className="hz-ai-video-progress" />
          </div>
          <div className="hz-ai-video-controls">
            <button type="button" className="hz-ai-video-icon-btn" aria-label="Ses">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M15.54 8.46a5 5 0 010 7.07" />
              </svg>
            </button>
            <button type="button" className="hz-ai-video-icon-btn" aria-label="Tam ekran">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
              </svg>
            </button>
            <button type="button" className="hz-ai-video-icon-btn" aria-label="Daha fazla">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </button>
          </div>
        </div>
        <div className="hz-ai-video-viewport">
          <p className="hz-ai-video-placeholder">Canlı oturum / özet akışı için yer tutucu</p>
        </div>
      </div>

      <div className="hz-ai-chat">
        <label className="hz-ai-chat-label" htmlFor="hz-ai-chat-input">
          Asistan
        </label>
        <textarea
          id="hz-ai-chat-input"
          className="hz-ai-chat-input"
          rows={4}
          readOnly
          placeholder="Özet veya taslak burada görünecek (demo)."
        />
        <button type="button" className="hz-ai-voice-btn" disabled>
          Sesli asistan (demo)
        </button>
      </div>
    </div>
  );
}
