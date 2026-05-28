import type { ReactNode } from "react";

export type ApprovalsBoardRiskKey = "high" | "medium" | "critical" | "normal";

export interface ApprovalsBoardCard {
  id: string;
  categoryLabel: string;
  risk: ApprovalsBoardRiskKey;
  customer: string;
  docLine: string;
  summaryLine: string;
  description: string;
  date: string;
  rep: string;
  accent: string;
  icon: ReactNode;
}
