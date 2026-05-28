// @ts-nocheck
import { BDM_ACTIONS, BDM_PREVIEW } from "../data/belgeler-detay-mock";

export type BelgelerDetayReferenceSnapshot = {
  preview: typeof BDM_PREVIEW;
  actions: typeof BDM_ACTIONS;
};

const build = (): BelgelerDetayReferenceSnapshot => ({
  preview: BDM_PREVIEW,
  actions: BDM_ACTIONS
});

export const BELGELER_DETAY_REFERENCE_INITIAL = build();
export const loadBelgelerDetayReferenceDemo = () => build();
export const loadBelgelerDetayReferenceLive = async () => build();
