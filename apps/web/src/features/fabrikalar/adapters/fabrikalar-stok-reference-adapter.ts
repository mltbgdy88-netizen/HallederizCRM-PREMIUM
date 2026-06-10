// @ts-nocheck
import {
  FST_CONTEXT,
  FST_FILTERS,
  FST_FILTER_SEARCH,
  FST_KPIS,
  FST_PAGE_NUMBERS,
  FST_SUBTITLE,
  FST_TABLE_ROWS,
  FST_TABLE_TOTAL,
  FST_TITLE,
  FST_WARN_BANNER
} from "../data/fabrikalar-stok-operasyon-mock";

export type FabrikalarStokReferenceSnapshot = {
  title: string;
  subtitle: string;
  kpis: typeof FST_KPIS;
  warnBanner: string;
  filterSearch: string;
  filters: typeof FST_FILTERS;
  tableRows: typeof FST_TABLE_ROWS;
  tableTotal: string;
  pageNumbers: readonly string[];
  context: typeof FST_CONTEXT;
};

const build = (): FabrikalarStokReferenceSnapshot => ({
  title: FST_TITLE,
  subtitle: FST_SUBTITLE,
  kpis: FST_KPIS,
  warnBanner: FST_WARN_BANNER,
  filterSearch: FST_FILTER_SEARCH,
  filters: FST_FILTERS,
  tableRows: FST_TABLE_ROWS,
  tableTotal: FST_TABLE_TOTAL,
  pageNumbers: FST_PAGE_NUMBERS,
  context: FST_CONTEXT
});

export const FABRIKALAR_STOK_REFERENCE_INITIAL = build();
export const loadFabrikalarStokReferenceDemo = () => build();
export const loadFabrikalarStokReferenceLive = async () => build();
