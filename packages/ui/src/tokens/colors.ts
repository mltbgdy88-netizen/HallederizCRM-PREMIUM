/**
 * Emerald / gold / ivory foundation palette (Agent 01).
 * Runtime UI uses CSS variables; these literals are for TS consumers and docs.
 */
export const hzFoundationColors = {
  emerald: "#047857",
  sidebar: "#064E3B",
  gold: "#D6A21E",
  goldSoft: "#F7D774",
  bg: "#F8F6EF",
  surface: "#FFFDF7",
  text: "#17231D",
  muted: "#667568",
  danger: "#B42318",
  info: "#2563EB"
} as const;

export type HzFoundationColorKey = keyof typeof hzFoundationColors;
