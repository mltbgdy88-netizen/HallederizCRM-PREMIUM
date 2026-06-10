// @ts-nocheck
import {
  TYH_DRAFTS,
  TYH_HUB,
  TYH_OPTIONS,
  TYH_PAGE,
  TYH_TIP
} from "../data/teklifler-yeni-mock";

export type TekliflerYeniReferenceSnapshot = {
  page: typeof TYH_PAGE;
  hub: typeof TYH_HUB;
  options: typeof TYH_OPTIONS;
  drafts: typeof TYH_DRAFTS;
  tip: string;
};

const build = (): TekliflerYeniReferenceSnapshot => ({
  page: TYH_PAGE,
  hub: TYH_HUB,
  options: TYH_OPTIONS,
  drafts: TYH_DRAFTS,
  tip: TYH_TIP
});

export const TEKLIFLER_YENI_REFERENCE_INITIAL = build();
export const loadTekliflerYeniReferenceDemo = () => build();
export const loadTekliflerYeniReferenceLive = async () => build();
