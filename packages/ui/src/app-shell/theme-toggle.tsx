export type ThemeMode = "light" | "dark";

export interface ThemeToggleProps {
  mode: ThemeMode;
  onToggle: () => void;
}

export function ThemeToggle({ mode, onToggle }: ThemeToggleProps) {
  const nextLabel = mode === "light" ? "Koyu" : "Acik";

  return (
    <button type="button" onClick={onToggle} className="hz-theme-toggle">
      Tema: {nextLabel}
    </button>
  );
}
