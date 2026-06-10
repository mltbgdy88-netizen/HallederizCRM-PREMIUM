// @ts-nocheck
import {
  SYH_CARDS,
  SYH_FEATURES,
  SYH_SUBTITLE,
  SYH_TITLE
} from "../data/siparisler-yeni-hub-mock";

export type SiparislerYeniHubReferenceSnapshot = {
  title: string;
  subtitle: string;
  cards: typeof SYH_CARDS;
  features: typeof SYH_FEATURES;
};

const build = (): SiparislerYeniHubReferenceSnapshot => ({
  title: SYH_TITLE,
  subtitle: SYH_SUBTITLE,
  cards: SYH_CARDS,
  features: SYH_FEATURES
});

export const SIPARISLER_YENI_HUB_REFERENCE_INITIAL = build();
export const loadSiparislerYeniHubReferenceDemo = () => build();
export const loadSiparislerYeniHubReferenceLive = async () => build();
