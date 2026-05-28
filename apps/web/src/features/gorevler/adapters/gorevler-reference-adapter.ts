import {
  GOM_FILTERS,
  GOM_FILTER_SEARCH,
  GOM_KPIS,
  GOM_PAGE_NUMBERS,
  GOM_SUBTITLE,
  GOM_TABLE_ROWS,
  GOM_TABLE_TOTAL,
  GOM_TITLE,
  getGomContext,
  type GomTableRow
} from "../data/gorevler-operasyon-mock";

export type GorevlerReferenceSnapshot = {
  title: string;
  subtitle: string;
  kpis: typeof GOM_KPIS;
  filterSearch: string;
  filters: typeof GOM_FILTERS;
  tableRows: GomTableRow[];
  tableTotal: string;
  pageNumbers: readonly string[];
  getContext: typeof getGomContext;
};

function buildSnapshot(): GorevlerReferenceSnapshot {
  return {
    title: GOM_TITLE,
    subtitle: GOM_SUBTITLE,
    kpis: GOM_KPIS,
    filterSearch: GOM_FILTER_SEARCH,
    filters: GOM_FILTERS,
    tableRows: GOM_TABLE_ROWS,
    tableTotal: GOM_TABLE_TOTAL,
    pageNumbers: GOM_PAGE_NUMBERS,
    getContext: getGomContext
  };
}

export const GOREVLER_REFERENCE_INITIAL = buildSnapshot();

export function loadGorevlerReferenceDemo(): GorevlerReferenceSnapshot {
  return buildSnapshot();
}

export async function loadGorevlerReferenceLive(): Promise<GorevlerReferenceSnapshot> {
  return buildSnapshot();
}
