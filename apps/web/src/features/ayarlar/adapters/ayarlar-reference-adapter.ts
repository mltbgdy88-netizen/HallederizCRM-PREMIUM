// @ts-nocheck
import { AHB_CARDS, AHB_SUBTITLE, AHB_TITLE } from "../data/ayarlar-hub-mock";

export type AyarlarReferenceSnapshot = {
  title: string;
  subtitle: string;
  cards: typeof AHB_CARDS;
};

const build = (): AyarlarReferenceSnapshot => ({
  title: AHB_TITLE,
  subtitle: AHB_SUBTITLE,
  cards: AHB_CARDS
});

export const AYARLAR_REFERENCE_INITIAL = build();
export const loadAyarlarReferenceDemo = () => build();
export const loadAyarlarReferenceLive = async () => build();
