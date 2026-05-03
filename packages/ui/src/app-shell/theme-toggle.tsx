export type ThemeMode = "light" | "dark";

export interface ThemeToggleProps {
  mode: ThemeMode;
  onToggle: () => void;
  /** Compact icon-style control for dense headers (e.g. dashboard). */
  compact?: boolean;
}

export function ThemeToggle({ mode, onToggle, compact = false }: ThemeToggleProps) {
  const nextLabel = mode === "light" ? "Koyu" : "Açık";

  if (compact) {
    return (
      <button type="button" onClick={onToggle} className="hz-theme-toggle hz-theme-toggle--compact" aria-label={`Tema: ${nextLabel}`} title={`Tema: ${nextLabel}`}>
        <span className="hz-theme-toggle-ico" aria-hidden>
          {mode === "light" ? "☾" : "☀"}
        </span>
      </button>
    );
  }

  return (
    <button type="button" onClick={onToggle} className="hz-theme-toggle">
      Tema: {nextLabel}
    </button>
  );
}
