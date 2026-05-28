// @ts-nocheck
import {
  DFD_CONTEXT,
  DFD_HISTORY,
  DFD_LINE_TOTALS,
  DFD_LINES,
  DFD_META,
  DFD_NOTES,
  DFD_PAGE,
  DFD_SUMMARY
} from "../data/depo-fis-detay-mock";

export type DepoFisDetayReferenceSnapshot = {
  page: typeof DFD_PAGE;
  meta: typeof DFD_META;
  lines: typeof DFD_LINES;
  lineTotals: typeof DFD_LINE_TOTALS;
  summary: typeof DFD_SUMMARY;
  history: typeof DFD_HISTORY;
  notes: string;
  context: typeof DFD_CONTEXT;
};

const build = (): DepoFisDetayReferenceSnapshot => ({
  page: DFD_PAGE,
  meta: DFD_META,
  lines: DFD_LINES,
  lineTotals: DFD_LINE_TOTALS,
  summary: DFD_SUMMARY,
  history: DFD_HISTORY,
  notes: DFD_NOTES,
  context: DFD_CONTEXT
});

export const DEPO_FIS_DETAY_REFERENCE_INITIAL = build();
export const loadDepoFisDetayReferenceDemo = () => build();
export const loadDepoFisDetayReferenceLive = async () => build();
