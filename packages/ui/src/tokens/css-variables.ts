/** Canonical CSS custom property names (foundation). */
export const hzCssVariables = {
  colorEmerald: "--hz-color-emerald",
  colorSidebar: "--hz-color-sidebar",
  colorGold: "--hz-color-gold",
  colorGoldSoft: "--hz-color-gold-soft",
  colorBg: "--hz-color-bg",
  colorSurface: "--hz-color-surface",
  colorText: "--hz-color-text",
  colorMuted: "--hz-color-muted",
  colorDanger: "--hz-color-danger",
  colorInfo: "--hz-color-info",
  radiusCard: "--hz-radius-card",
  contentMaxWidth: "--hz-content-max-width",
  detailPanelWidth: "--hz-detail-panel-width",
  uiBrandPrimary: "--hz-ui-brand-primary",
  uiBrandGold: "--hz-ui-brand-gold",
  uiFocusRing: "--hz-ui-focus-ring"
} as const;

export type HzCssVariableKey = keyof typeof hzCssVariables;

/** Resolve `var(--hz-…)` for inline styles or CSS-in-JS. */
export function hzVar(key: HzCssVariableKey): string {
  return `var(${hzCssVariables[key]})`;
}
