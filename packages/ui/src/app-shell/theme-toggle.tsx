export type ThemeMode = "light" | "dark";

export interface ThemeToggleProps {
  mode: ThemeMode;
  onToggle: () => void;
  /** Compact icon-style control for dense headers (e.g. dashboard). */
  compact?: boolean;
}

function ThemeModeIcon({ mode }: { mode: ThemeMode }) {
  if (mode === "light") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
        <path d="M12 3v2.2M12 18.8V21M4.64 4.64l1.56 1.56M17.8 17.8l1.56 1.56M3 12h2.2M18.8 12H21M4.64 19.36l1.56-1.56M17.8 6.2l1.56-1.56" />
        <circle cx="12" cy="12" r="4.2" />
      </svg>
    );
  }

  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M20.4 14.4A7.8 7.8 0 019.6 3.6 8.2 8.2 0 1012 20.5a8 8 0 008.4-6.1z" />
    </svg>
  );
}

export function ThemeToggle({ mode, onToggle, compact = false }: ThemeToggleProps) {
  const currentLabel = mode === "light" ? "Açık" : "Koyu";
  const nextLabel = mode === "light" ? "Koyu" : "Açık";

  if (compact) {
    return (
      <button type="button" onClick={onToggle} className="hz-theme-toggle hz-theme-toggle--compact" aria-label={`Tema: ${currentLabel}. ${nextLabel} moda geç`} title={`${nextLabel} moda geç`}>
        <span className="hz-theme-toggle-ico" aria-hidden>
          <ThemeModeIcon mode={mode} />
        </span>
        <span className="hz-theme-toggle-label">{currentLabel}</span>
      </button>
    );
  }

  return (
    <button type="button" onClick={onToggle} className="hz-theme-toggle" aria-label={`Tema: ${currentLabel}. ${nextLabel} moda geç`}>
      <span className="hz-theme-toggle-ico" aria-hidden>
        <ThemeModeIcon mode={mode} />
      </span>
      <span className="hz-theme-toggle-label">Tema: {currentLabel}</span>
    </button>
  );
}
