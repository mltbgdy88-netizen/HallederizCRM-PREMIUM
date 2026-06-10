// @ts-nocheck
import {
  EEM_CONNECTIONS,
  EEM_HEALTH,
  EEM_KPIS,
  EEM_PAGE_NUMBERS,
  EEM_SUBTITLE,
  EEM_TABLE_ROWS,
  EEM_TABLE_TOTAL,
  EEM_TABS,
  EEM_TITLE
} from "../data/erp-entegrasyon-mock";

export type ErpReferenceSnapshot = {
  title: string;
  subtitle: string;
  kpis: typeof EEM_KPIS;
  tabs: typeof EEM_TABS;
  tableRows: typeof EEM_TABLE_ROWS;
  tableTotal: string;
  pageNumbers: readonly string[];
  connections: typeof EEM_CONNECTIONS;
  health: typeof EEM_HEALTH;
};

function build(): ErpReferenceSnapshot {
  return {
    title: EEM_TITLE,
    subtitle: EEM_SUBTITLE,
    kpis: EEM_KPIS,
    tabs: EEM_TABS,
    tableRows: EEM_TABLE_ROWS,
    tableTotal: EEM_TABLE_TOTAL,
    pageNumbers: EEM_PAGE_NUMBERS,
    connections: EEM_CONNECTIONS,
    health: EEM_HEALTH
  };
}

export const ERP_REFERENCE_INITIAL = build();
export const loadErpReferenceDemo = () => build();
export const loadErpReferenceLive = async () => build();
