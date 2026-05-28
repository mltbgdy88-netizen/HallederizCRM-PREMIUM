"use client";

import { InventoryCommandCenterPage } from "./InventoryCommandCenterPage";
import {
  buildOfferLayerConfig,
  LISTE_CONFIG,
  type OfferLayerKey
} from "../utils/teklifler-subroute-command-center-data";

export function TekliflerListeCommandCenterPage() {
  return <InventoryCommandCenterPage config={LISTE_CONFIG} />;
}

function OfferLayerPage({ layer, offerId }: { layer: OfferLayerKey; offerId: string }) {
  const config = buildOfferLayerConfig(layer, offerId);
  return <InventoryCommandCenterPage config={config} />;
}

export function TekliflerOfferidOzetCommandCenterPage({ offerId }: { offerId: string }) {
  return <OfferLayerPage layer="ozet" offerId={offerId} />;
}

export function TekliflerOfferidSatirlarCommandCenterPage({ offerId }: { offerId: string }) {
  return <OfferLayerPage layer="satirlar" offerId={offerId} />;
}

export function TekliflerOfferidMusteriCommandCenterPage({ offerId }: { offerId: string }) {
  return <OfferLayerPage layer="musteri" offerId={offerId} />;
}

export function TekliflerOfferidSipariseDonusturmeCommandCenterPage({ offerId }: { offerId: string }) {
  return <OfferLayerPage layer="siparise-donusturme" offerId={offerId} />;
}

export function TekliflerOfferidBelgelerCommandCenterPage({ offerId }: { offerId: string }) {
  return <OfferLayerPage layer="belgeler" offerId={offerId} />;
}

export function TekliflerOfferidTimelineCommandCenterPage({ offerId }: { offerId: string }) {
  return <OfferLayerPage layer="timeline" offerId={offerId} />;
}
