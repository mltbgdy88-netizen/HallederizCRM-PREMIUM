// @ts-nocheck
import {
  TSYF_ACTIONS,
  TSYF_FORM,
  TSYF_PRODUCT_ROW,
  TSYF_SALES_LINK,
  TSYF_SUMMARY,
  TSYF_TOP_FIELDS
} from "../data/teslimatlar-yeni-form-mock";

export type TeslimatlarYeniFormReferenceSnapshot = {
  form: typeof TSYF_FORM;
  topFields: typeof TSYF_TOP_FIELDS;
  productRow: typeof TSYF_PRODUCT_ROW;
  summary: typeof TSYF_SUMMARY;
  salesLink: typeof TSYF_SALES_LINK;
  actions: typeof TSYF_ACTIONS;
};

const build = (): TeslimatlarYeniFormReferenceSnapshot => ({
  form: TSYF_FORM,
  topFields: TSYF_TOP_FIELDS,
  productRow: TSYF_PRODUCT_ROW,
  summary: TSYF_SUMMARY,
  salesLink: TSYF_SALES_LINK,
  actions: TSYF_ACTIONS
});

export const TESLIMATLAR_YENI_FORM_REFERENCE_INITIAL = build();
export const loadTeslimatlarYeniFormReferenceDemo = () => build();
export const loadTeslimatlarYeniFormReferenceLive = async () => build();
