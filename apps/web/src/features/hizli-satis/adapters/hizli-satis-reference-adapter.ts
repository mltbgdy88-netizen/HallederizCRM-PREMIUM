// @ts-nocheck
import {
  HSM_APPROVAL,
  HSM_DOC_ACTIONS,
  HSM_FOOTER_ACTIONS,
  HSM_FORM,
  HSM_HEADER_ACTIONS,
  HSM_INFO_BANNERS,
  HSM_LINES,
  HSM_PAYMENT,
  HSM_SUBTITLE,
  HSM_SUMMARY,
  HSM_TITLE
} from "../data/hizli-satis-masasi-mock";

export type HizliSatisReferenceSnapshot = {
  title: string;
  subtitle: string;
  headerActions: typeof HSM_HEADER_ACTIONS;
  form: typeof HSM_FORM;
  infoBanners: typeof HSM_INFO_BANNERS;
  lines: typeof HSM_LINES;
  summary: typeof HSM_SUMMARY;
  payment: typeof HSM_PAYMENT;
  approval: typeof HSM_APPROVAL;
  docActions: typeof HSM_DOC_ACTIONS;
  footerActions: typeof HSM_FOOTER_ACTIONS;
};

const build = (): HizliSatisReferenceSnapshot => ({
  title: HSM_TITLE,
  subtitle: HSM_SUBTITLE,
  headerActions: HSM_HEADER_ACTIONS,
  form: HSM_FORM,
  infoBanners: HSM_INFO_BANNERS,
  lines: HSM_LINES,
  summary: HSM_SUMMARY,
  payment: HSM_PAYMENT,
  approval: HSM_APPROVAL,
  docActions: HSM_DOC_ACTIONS,
  footerActions: HSM_FOOTER_ACTIONS
});

export const HIZLI_SATIS_REFERENCE_INITIAL = build();
export const loadHizliSatisReferenceDemo = () => build();
export const loadHizliSatisReferenceLive = async () => build();
