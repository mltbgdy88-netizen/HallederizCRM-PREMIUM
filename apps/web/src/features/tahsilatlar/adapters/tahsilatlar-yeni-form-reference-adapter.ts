// @ts-nocheck
import {
  THYF_AMOUNT_DEFAULT,
  THYF_CARI_PLACEHOLDER,
  THYF_DATE_DEFAULT,
  THYF_DESC_COUNTER,
  THYF_DESC_PLACEHOLDER,
  THYF_DISTRIBUTION_ROWS,
  THYF_SUMMARY,
  THYF_TITLE
} from "../data/tahsilatlar-yeni-form-mock";

export type TahsilatlarYeniFormReferenceSnapshot = {
  title: string;
  amountDefault: string;
  dateDefault: string;
  cariPlaceholder: string;
  descPlaceholder: string;
  descCounter: string;
  distributionRows: typeof THYF_DISTRIBUTION_ROWS;
  summary: typeof THYF_SUMMARY;
};

const build = (): TahsilatlarYeniFormReferenceSnapshot => ({
  title: THYF_TITLE,
  amountDefault: THYF_AMOUNT_DEFAULT,
  dateDefault: THYF_DATE_DEFAULT,
  cariPlaceholder: THYF_CARI_PLACEHOLDER,
  descPlaceholder: THYF_DESC_PLACEHOLDER,
  descCounter: THYF_DESC_COUNTER,
  distributionRows: THYF_DISTRIBUTION_ROWS,
  summary: THYF_SUMMARY
});

export const TAHSILATLAR_YENI_FORM_REFERENCE_INITIAL = build();
export const loadTahsilatlarYeniFormReferenceDemo = () => build();
export const loadTahsilatlarYeniFormReferenceLive = async () => build();
