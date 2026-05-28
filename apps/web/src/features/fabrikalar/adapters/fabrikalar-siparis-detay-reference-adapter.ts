// @ts-nocheck
import {
  FSD_BREADCRUMB,
  FSD_CONTEXT,
  FSD_FIELDS,
  FSD_GRAND_TOTAL,
  FSD_LINES,
  FSD_STATUS_CARDS,
  FSD_SUMMARY,
  FSD_TIMELINE,
  FSD_TITLE
} from "../data/fabrikalar-siparis-detay-mock";

export type FabrikalarSiparisDetayReferenceSnapshot = {
  breadcrumb: string;
  title: string;
  statusCards: typeof FSD_STATUS_CARDS;
  fields: typeof FSD_FIELDS;
  lines: typeof FSD_LINES;
  grandTotal: string;
  summary: typeof FSD_SUMMARY;
  timeline: typeof FSD_TIMELINE;
  context: typeof FSD_CONTEXT;
};

const build = (): FabrikalarSiparisDetayReferenceSnapshot => ({
  breadcrumb: FSD_BREADCRUMB,
  title: FSD_TITLE,
  statusCards: FSD_STATUS_CARDS,
  fields: FSD_FIELDS,
  lines: FSD_LINES,
  grandTotal: FSD_GRAND_TOTAL,
  summary: FSD_SUMMARY,
  timeline: FSD_TIMELINE,
  context: FSD_CONTEXT
});

export const FABRIKALAR_SIPARIS_DETAY_REFERENCE_INITIAL = build();
export const loadFabrikalarSiparisDetayReferenceDemo = () => build();
export const loadFabrikalarSiparisDetayReferenceLive = async () => build();
