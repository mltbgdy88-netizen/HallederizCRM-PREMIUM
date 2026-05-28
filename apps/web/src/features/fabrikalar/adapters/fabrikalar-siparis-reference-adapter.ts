// @ts-nocheck
import {
  FSO_FILTERS,
  FSO_FILTER_SEARCH,
  FSO_KPIS,
  FSO_PAGE_NUMBERS,
  FSO_STATUS_CHIPS,
  FSO_SUBTITLE,
  FSO_TABLE_ROWS,
  FSO_TABLE_TOTAL,
  FSO_TITLE,
  getFsoContext
} from "../data/fabrikalar-siparis-operasyon-mock";

export type FabrikalarSiparisReferenceSnapshot = {
  title: string;
  subtitle: string;
  kpis: typeof FSO_KPIS;
  filterSearch: string;
  filters: typeof FSO_FILTERS;
  statusChips: typeof FSO_STATUS_CHIPS;
  tableRows: typeof FSO_TABLE_ROWS;
  tableTotal: string;
  pageNumbers: readonly string[];
  getContext: typeof getFsoContext;
};

function build(): FabrikalarSiparisReferenceSnapshot {
  return {
    title: FSO_TITLE,
    subtitle: FSO_SUBTITLE,
    kpis: FSO_KPIS,
    filterSearch: FSO_FILTER_SEARCH,
    filters: FSO_FILTERS,
    statusChips: FSO_STATUS_CHIPS,
    tableRows: FSO_TABLE_ROWS,
    tableTotal: FSO_TABLE_TOTAL,
    pageNumbers: FSO_PAGE_NUMBERS,
    getContext: getFsoContext
  };
}

export const FABRIKALAR_SIPARIS_REFERENCE_INITIAL = build();
export const loadFabrikalarSiparisReferenceDemo = () => build();
export const loadFabrikalarSiparisReferenceLive = async () => build();
