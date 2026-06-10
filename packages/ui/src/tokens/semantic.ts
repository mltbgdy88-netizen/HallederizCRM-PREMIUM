import { hzFoundationColors } from "./colors";
import { hzCssVariables } from "./css-variables";

/**
 * Semantic token map — mirrors CSS foundation aliases.
 * Prefer CSS variables in components; use this for typed references in TS.
 */
export const hzSemanticTokens = {
  color: {
    brand: {
      primary: hzFoundationColors.emerald,
      sidebar: hzFoundationColors.sidebar,
      gold: hzFoundationColors.gold,
      goldSoft: hzFoundationColors.goldSoft
    },
    surface: {
      canvas: hzFoundationColors.bg,
      card: hzFoundationColors.surface,
      elevated: hzFoundationColors.surface,
      muted: "#F0EDE4"
    },
    text: {
      primary: hzFoundationColors.text,
      secondary: "#2A3B32",
      muted: hzFoundationColors.muted
    },
    border: {
      subtle: "#E4DFD0",
      strong: "#C9C2B0"
    },
    status: {
      success: hzFoundationColors.emerald,
      warning: hzFoundationColors.gold,
      danger: hzFoundationColors.danger,
      info: hzFoundationColors.info
    }
  },
  radius: {
    card: "16px",
    control: "10px",
    modal: "18px"
  },
  shadow: {
    card: "0 8px 20px rgba(23, 35, 29, 0.06)",
    panel: "0 12px 28px rgba(23, 35, 29, 0.08)"
  },
  layout: {
    contentMaxWidth: "1604px",
    detailPanelWidth: "360px"
  },
  cssVar: hzCssVariables
} as const;

