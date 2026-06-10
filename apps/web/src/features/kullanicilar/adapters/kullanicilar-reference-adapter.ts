// @ts-nocheck
import {
  KUM_FILTERS,
  KUM_FILTER_SEARCH,
  KUM_KPIS,
  KUM_PAGE_NUMBERS,
  KUM_SUBTITLE,
  KUM_TABLE_ROWS,
  KUM_TABLE_TOTAL,
  KUM_TITLE,
  getKumContext
} from "../data/kullanicilar-operasyon-mock";

export type KullanicilarReferenceSnapshot = {
  title: string;
  subtitle: string;
  kpis: typeof KUM_KPIS;
  filterSearch: string;
  filters: typeof KUM_FILTERS;
  tableRows: typeof KUM_TABLE_ROWS;
  tableTotal: string;
  pageNumbers: readonly string[];
  getContext: typeof getKumContext;
};

function build(): KullanicilarReferenceSnapshot {
  return {
    title: KUM_TITLE,
    subtitle: KUM_SUBTITLE,
    kpis: KUM_KPIS,
    filterSearch: KUM_FILTER_SEARCH,
    filters: KUM_FILTERS,
    tableRows: KUM_TABLE_ROWS,
    tableTotal: KUM_TABLE_TOTAL,
    pageNumbers: KUM_PAGE_NUMBERS,
    getContext: getKumContext
  };
}

export const KULLANICILAR_REFERENCE_INITIAL = build();
export const loadKullanicilarReferenceDemo = () => build();
export const loadKullanicilarReferenceLive = async () => build();
