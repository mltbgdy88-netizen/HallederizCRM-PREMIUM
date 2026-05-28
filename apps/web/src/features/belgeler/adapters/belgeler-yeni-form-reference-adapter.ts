// @ts-nocheck
import {
  BYM_FIELDS,
  BYM_PAGE,
  BYM_SECURE,
  BYM_SETTINGS,
  BYM_UPLOAD_HINT,
  BYM_UPLOAD_INFO
} from "../data/belgeler-yeni-form-mock";

export type BelgelerYeniFormReferenceSnapshot = {
  page: typeof BYM_PAGE;
  fields: typeof BYM_FIELDS;
  settings: typeof BYM_SETTINGS;
  uploadHint: string;
  uploadInfo: typeof BYM_UPLOAD_INFO;
  secure: string;
};

const build = (): BelgelerYeniFormReferenceSnapshot => ({
  page: BYM_PAGE,
  fields: BYM_FIELDS,
  settings: BYM_SETTINGS,
  uploadHint: BYM_UPLOAD_HINT,
  uploadInfo: BYM_UPLOAD_INFO,
  secure: BYM_SECURE
});

export const BELGELER_YENI_FORM_REFERENCE_INITIAL = build();
export const loadBelgelerYeniFormReferenceDemo = () => build();
export const loadBelgelerYeniFormReferenceLive = async () => build();
