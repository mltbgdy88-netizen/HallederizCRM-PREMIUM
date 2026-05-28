// @ts-nocheck
import {
  DHM_FILTERS,
  DHM_FILTER_SEARCH,
  DHM_KPIS,
  DHM_PAGE_NUMBERS,
  DHM_SUBTITLE,
  DHM_TABLE_ROWS,
  DHM_TABLE_TOTAL,
  DHM_TABS,
  DHM_TITLE,
  getDhmContext
} from "../data/depo-hazirlik-mock";

export type DepoReferenceSnapshot = {
  title: string;
  subtitle: string;
  kpis: typeof DHM_KPIS;
  tabs: typeof DHM_TABS;
  filterSearch: string;
  filters: typeof DHM_FILTERS;
  tableRows: typeof DHM_TABLE_ROWS;
  tableTotal: string;
  pageNumbers: readonly string[];
  getContext: typeof getDhmContext;
};

function build(): DepoReferenceSnapshot {
  return {
    title: DHM_TITLE,
    subtitle: DHM_SUBTITLE,
    kpis: DHM_KPIS,
    tabs: DHM_TABS,
    filterSearch: DHM_FILTER_SEARCH,
    filters: DHM_FILTERS,
    tableRows: DHM_TABLE_ROWS,
    tableTotal: DHM_TABLE_TOTAL,
    pageNumbers: DHM_PAGE_NUMBERS,
    getContext: getDhmContext
  };
}

export const DEPO_REFERENCE_INITIAL = build();
export const loadDepoReferenceDemo = () => build();
export const loadDepoReferenceLive = async () => build();
