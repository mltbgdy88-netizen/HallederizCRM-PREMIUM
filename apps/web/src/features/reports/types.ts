export type ReportDiffTone = "positive" | "negative" | "warning" | "neutral" | "risk";

/** Filtre chip / rapor tipi gruplaması */
export type ReportCategoryChip =
  | "genel"
  | "satis"
  | "tahsilat"
  | "stok"
  | "iade"
  | "whatsapp"
  | "ai";

export interface ReportMetricRow {
  id: string;
  title: string;
  code: string;
  segment: string;
  periodLabel: string;
  actualDisplay: string;
  targetDisplay: string;
  diffDisplay: string;
  diffTone: ReportDiffTone;
  chip: ReportCategoryChip;
  trendLabel: string;
  dataPeriodNote: string;
  calculationType: string;
  auditNote: string;
  updatedBy: string;
  updatedAtIso: string;
}
