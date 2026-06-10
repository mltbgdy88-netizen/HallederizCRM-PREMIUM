// @ts-nocheck
import {
  IYF_INFO,
  IYF_LINES,
  IYF_ORDER,
  IYF_PAGE,
  IYF_PREVIEW,
  IYF_SELECTED_TOTAL,
  IYF_STEPS,
  IYF_WARN,
  IYF_WHY
} from "../data/iadeler-yeni-form-mock";

export type IadelerYeniFormReferenceSnapshot = {
  page: typeof IYF_PAGE;
  steps: typeof IYF_STEPS;
  order: typeof IYF_ORDER;
  lines: typeof IYF_LINES;
  selectedTotal: string;
  info: string;
  warn: string;
  why: typeof IYF_WHY;
  preview: typeof IYF_PREVIEW;
};

const build = (): IadelerYeniFormReferenceSnapshot => ({
  page: IYF_PAGE,
  steps: IYF_STEPS,
  order: IYF_ORDER,
  lines: IYF_LINES,
  selectedTotal: IYF_SELECTED_TOTAL,
  info: IYF_INFO,
  warn: IYF_WARN,
  why: IYF_WHY,
  preview: IYF_PREVIEW
});

export const IADELER_YENI_FORM_REFERENCE_INITIAL = build();
export const loadIadelerYeniFormReferenceDemo = () => build();
export const loadIadelerYeniFormReferenceLive = async () => build();
