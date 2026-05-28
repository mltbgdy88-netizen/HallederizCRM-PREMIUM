// @ts-nocheck
import {
  CYF_ACTIONS,
  CYF_EXTRA_FIELDS,
  CYF_FIELDS,
  CYF_FORM,
  CYF_LOCATION
} from "../data/cariler-yeni-form-mock";

export type CarilerYeniFormReferenceSnapshot = {
  form: typeof CYF_FORM;
  fields: typeof CYF_FIELDS;
  location: typeof CYF_LOCATION;
  extraFields: typeof CYF_EXTRA_FIELDS;
  actions: typeof CYF_ACTIONS;
};

const build = (): CarilerYeniFormReferenceSnapshot => ({
  form: CYF_FORM,
  fields: CYF_FIELDS,
  location: CYF_LOCATION,
  extraFields: CYF_EXTRA_FIELDS,
  actions: CYF_ACTIONS
});

export const CARILER_YENI_FORM_REFERENCE_INITIAL = build();
export const loadCarilerYeniFormReferenceDemo = () => build();
export const loadCarilerYeniFormReferenceLive = async () => build();
