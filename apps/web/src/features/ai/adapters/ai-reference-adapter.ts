// @ts-nocheck
import {
  AIC_DETAIL,
  AIC_INSIGHTS,
  AIC_KPIS,
  AIC_LIST_FOOTER,
  AIC_PAGE,
  AIC_TABS
} from "../data/ai-icgoruler-mock";
import {
  AOH_FILTERS,
  AOH_FOOTER,
  AOH_KPIS,
  AOH_PAGE,
  AOH_PLANS,
  AOH_SYNC,
  AOH_TABS
} from "../data/ai-operator-hub-mock";

export type AiOperatorReferenceSnapshot = {
  page: typeof AOH_PAGE;
  kpis: typeof AOH_KPIS;
  tabs: typeof AOH_TABS;
  sync: typeof AOH_SYNC;
  filters: typeof AOH_FILTERS;
  plans: typeof AOH_PLANS;
  footer: typeof AOH_FOOTER;
};

export type AiIcgorulerReferenceSnapshot = {
  page: typeof AIC_PAGE;
  kpis: typeof AIC_KPIS;
  tabs: typeof AIC_TABS;
  insights: typeof AIC_INSIGHTS;
  detail: typeof AIC_DETAIL;
  listFooter: typeof AIC_LIST_FOOTER;
};

const buildOperator = (): AiOperatorReferenceSnapshot => ({
  page: AOH_PAGE,
  kpis: AOH_KPIS,
  tabs: AOH_TABS,
  sync: AOH_SYNC,
  filters: AOH_FILTERS,
  plans: AOH_PLANS,
  footer: AOH_FOOTER
});

const buildIcgoruler = (): AiIcgorulerReferenceSnapshot => ({
  page: AIC_PAGE,
  kpis: AIC_KPIS,
  tabs: AIC_TABS,
  insights: AIC_INSIGHTS,
  detail: AIC_DETAIL,
  listFooter: AIC_LIST_FOOTER
});

export const AI_OPERATOR_REFERENCE_INITIAL = buildOperator();
export const AI_ICGORULER_REFERENCE_INITIAL = buildIcgoruler();
export const loadAiOperatorReferenceDemo = () => buildOperator();
export const loadAiOperatorReferenceLive = async () => buildOperator();
export const loadAiIcgorulerReferenceDemo = () => buildIcgoruler();
export const loadAiIcgorulerReferenceLive = async () => buildIcgoruler();
