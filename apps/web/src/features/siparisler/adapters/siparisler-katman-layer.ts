// @ts-nocheck
import {
  SKM_CONTEXT,
  SKM_DEPO_ALERT,
  SKM_DEPO_CONTEXT,
  SKM_DEPO_KPIS,
  SKM_DEPO_ROWS,
  SKM_EXTRA_INFO,
  SKM_FATURA_CONTEXT,
  SKM_FATURA_KPIS,
  SKM_FATURA_ROWS,
  SKM_HEADER,
  SKM_IADE_CONTEXT,
  SKM_IADE_ROWS,
  SKM_LINE_CONTEXT,
  SKM_ODEME_CONTEXT,
  SKM_ODEME_KPIS,
  SKM_ODEME_ROWS,
  SKM_OZET_INFO,
  SKM_STATUS_STEPS,
  SKM_TABS,
  SKM_TESLIMAT_CONTEXT,
  SKM_TESLIMAT_ROWS,
  SKM_TIMELINE_CONTEXT,
  SKM_TIMELINE_EVENTS
} from "../data/siparisler-katman-mock";

export type SiparislerKatmanLayerSnapshot = {
  tabs: typeof SKM_TABS;
  header: typeof SKM_HEADER;
  context: typeof SKM_CONTEXT;
  ozetInfo: typeof SKM_OZET_INFO;
  statusSteps: typeof SKM_STATUS_STEPS;
  extraInfo: typeof SKM_EXTRA_INFO;
  lineContext: typeof SKM_LINE_CONTEXT;
  depoKpis: typeof SKM_DEPO_KPIS;
  depoAlert: string;
  depoRows: typeof SKM_DEPO_ROWS;
  depoContext: typeof SKM_DEPO_CONTEXT;
  faturaKpis: typeof SKM_FATURA_KPIS;
  faturaRows: typeof SKM_FATURA_ROWS;
  faturaContext: typeof SKM_FATURA_CONTEXT;
  iadeRows: typeof SKM_IADE_ROWS;
  iadeContext: typeof SKM_IADE_CONTEXT;
  odemeKpis: typeof SKM_ODEME_KPIS;
  odemeRows: typeof SKM_ODEME_ROWS;
  odemeContext: typeof SKM_ODEME_CONTEXT;
  teslimatRows: typeof SKM_TESLIMAT_ROWS;
  teslimatContext: typeof SKM_TESLIMAT_CONTEXT;
  timelineEvents: typeof SKM_TIMELINE_EVENTS;
  timelineContext: typeof SKM_TIMELINE_CONTEXT;
};

export function buildSiparislerKatmanLayer(): SiparislerKatmanLayerSnapshot {
  return {
    tabs: SKM_TABS,
    header: SKM_HEADER,
    context: SKM_CONTEXT,
    ozetInfo: SKM_OZET_INFO,
    statusSteps: SKM_STATUS_STEPS,
    extraInfo: SKM_EXTRA_INFO,
    lineContext: SKM_LINE_CONTEXT,
    depoKpis: SKM_DEPO_KPIS,
    depoAlert: SKM_DEPO_ALERT,
    depoRows: SKM_DEPO_ROWS,
    depoContext: SKM_DEPO_CONTEXT,
    faturaKpis: SKM_FATURA_KPIS,
    faturaRows: SKM_FATURA_ROWS,
    faturaContext: SKM_FATURA_CONTEXT,
    iadeRows: SKM_IADE_ROWS,
    iadeContext: SKM_IADE_CONTEXT,
    odemeKpis: SKM_ODEME_KPIS,
    odemeRows: SKM_ODEME_ROWS,
    odemeContext: SKM_ODEME_CONTEXT,
    teslimatRows: SKM_TESLIMAT_ROWS,
    teslimatContext: SKM_TESLIMAT_CONTEXT,
    timelineEvents: SKM_TIMELINE_EVENTS,
    timelineContext: SKM_TIMELINE_CONTEXT
  };
}
