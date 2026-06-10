// @ts-nocheck
import {
  BELGELER_DETAIL_TABS,
  BELGELER_DOCUMENTS,
  BELGELER_PREVIEW,
  DONUSUM_CONTEXT,
  DONUSUM_DETAIL_TABS,
  DONUSUM_STEPS,
  DONUSUM_STOCK_ROWS,
  DONUSUM_STOCK_SUMMARY,
  KATMAN_CONTEXT,
  KATMAN_TABS,
  MUSTERI_CONTEXT,
  MUSTERI_HISTORY,
  MUSTERI_PAGE,
  OZET_DETAILS_LEFT,
  OZET_DETAILS_RIGHT,
  OZET_KPIS,
  SATIRLAR_DETAIL_TABS,
  SATIRLAR_STOCK,
  SATIRLAR_SUMMARY,
  TIMELINE_CONTEXT,
  TIMELINE_DETAIL_TABS,
  TIMELINE_EVENTS
} from "../data/teklifler-katman-mock";

export type TekliflerKatmanLayerSnapshot = {
  tabs: typeof KATMAN_TABS;
  context: typeof KATMAN_CONTEXT;
  ozetKpis: typeof OZET_KPIS;
  ozetDetailsLeft: typeof OZET_DETAILS_LEFT;
  ozetDetailsRight: typeof OZET_DETAILS_RIGHT;
  satirlarDetailTabs: typeof SATIRLAR_DETAIL_TABS;
  satirlarSummary: typeof SATIRLAR_SUMMARY;
  satirlarStock: typeof SATIRLAR_STOCK;
  musteriPage: typeof MUSTERI_PAGE;
  musteriHistory: typeof MUSTERI_HISTORY;
  musteriContext: typeof MUSTERI_CONTEXT;
  timelineDetailTabs: typeof TIMELINE_DETAIL_TABS;
  timelineEvents: typeof TIMELINE_EVENTS;
  timelineContext: typeof TIMELINE_CONTEXT;
  belgelerDetailTabs: typeof BELGELER_DETAIL_TABS;
  belgelerDocuments: typeof BELGELER_DOCUMENTS;
  belgelerPreview: typeof BELGELER_PREVIEW;
  donusumDetailTabs: typeof DONUSUM_DETAIL_TABS;
  donusumSteps: typeof DONUSUM_STEPS;
  donusumStockSummary: typeof DONUSUM_STOCK_SUMMARY;
  donusumStockRows: typeof DONUSUM_STOCK_ROWS;
  donusumContext: typeof DONUSUM_CONTEXT;
};

export function buildTekliflerKatmanLayer(): TekliflerKatmanLayerSnapshot {
  return {
    tabs: KATMAN_TABS,
    context: KATMAN_CONTEXT,
    ozetKpis: OZET_KPIS,
    ozetDetailsLeft: OZET_DETAILS_LEFT,
    ozetDetailsRight: OZET_DETAILS_RIGHT,
    satirlarDetailTabs: SATIRLAR_DETAIL_TABS,
    satirlarSummary: SATIRLAR_SUMMARY,
    satirlarStock: SATIRLAR_STOCK,
    musteriPage: MUSTERI_PAGE,
    musteriHistory: MUSTERI_HISTORY,
    musteriContext: MUSTERI_CONTEXT,
    timelineDetailTabs: TIMELINE_DETAIL_TABS,
    timelineEvents: TIMELINE_EVENTS,
    timelineContext: TIMELINE_CONTEXT,
    belgelerDetailTabs: BELGELER_DETAIL_TABS,
    belgelerDocuments: BELGELER_DOCUMENTS,
    belgelerPreview: BELGELER_PREVIEW,
    donusumDetailTabs: DONUSUM_DETAIL_TABS,
    donusumSteps: DONUSUM_STEPS,
    donusumStockSummary: DONUSUM_STOCK_SUMMARY,
    donusumStockRows: DONUSUM_STOCK_ROWS,
    donusumContext: DONUSUM_CONTEXT
  };
}
