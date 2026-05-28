// @ts-nocheck
import {
  FYF_ACTIONS,
  FYF_CARI,
  FYF_INFO,
  FYF_INVOICE,
  FYF_LINE_ACTIONS,
  FYF_LINE_COLUMNS,
  FYF_LINES,
  FYF_OTHER,
  FYF_PAGE,
  FYF_TOTALS,
  FYF_VAT_ROWS
} from "../data/faturalar-yeni-form-mock";

export type FaturalarYeniFormReferenceSnapshot = {
  page: typeof FYF_PAGE;
  actions: typeof FYF_ACTIONS;
  cari: typeof FYF_CARI;
  invoice: typeof FYF_INVOICE;
  other: typeof FYF_OTHER;
  lineColumns: typeof FYF_LINE_COLUMNS;
  lines: typeof FYF_LINES;
  lineActions: typeof FYF_LINE_ACTIONS;
  vatRows: typeof FYF_VAT_ROWS;
  totals: typeof FYF_TOTALS;
  info: string;
};

const build = (): FaturalarYeniFormReferenceSnapshot => ({
  page: FYF_PAGE,
  actions: FYF_ACTIONS,
  cari: FYF_CARI,
  invoice: FYF_INVOICE,
  other: FYF_OTHER,
  lineColumns: FYF_LINE_COLUMNS,
  lines: FYF_LINES,
  lineActions: FYF_LINE_ACTIONS,
  vatRows: FYF_VAT_ROWS,
  totals: FYF_TOTALS,
  info: FYF_INFO
});

export const FATURALAR_YENI_FORM_REFERENCE_INITIAL = build();
export const loadFaturalarYeniFormReferenceDemo = () => build();
export const loadFaturalarYeniFormReferenceLive = async () => build();
