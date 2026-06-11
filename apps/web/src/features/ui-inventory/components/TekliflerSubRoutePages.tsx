"use client";

import { OfferReferenceLayerPage } from "../../offers/components/OfferReferenceLayerPage";
import { InventoryCommandCenterPage } from "./InventoryCommandCenterPage";
import { LISTE_CONFIG } from "../utils/teklifler-subroute-command-center-data";

export function TekliflerListeCommandCenterPage() {
  return <InventoryCommandCenterPage config={LISTE_CONFIG} />;
}

export function TekliflerOfferidOzetCommandCenterPage({ offerId }: { offerId: string }) {
  return <OfferReferenceLayerPage offerId={offerId} layer="ozet" />;
}

export function TekliflerOfferidSatirlarCommandCenterPage({ offerId }: { offerId: string }) {
  return <OfferReferenceLayerPage offerId={offerId} layer="satirlar" />;
}

export function TekliflerOfferidMusteriCommandCenterPage({ offerId }: { offerId: string }) {
  return <OfferReferenceLayerPage offerId={offerId} layer="musteri" />;
}

export function TekliflerOfferidSipariseDonusturmeCommandCenterPage({ offerId }: { offerId: string }) {
  return <OfferReferenceLayerPage offerId={offerId} layer="siparise-donusturme" />;
}

export function TekliflerOfferidBelgelerCommandCenterPage({ offerId }: { offerId: string }) {
  return <OfferReferenceLayerPage offerId={offerId} layer="belgeler" />;
}

export function TekliflerOfferidTimelineCommandCenterPage({ offerId }: { offerId: string }) {
  return <OfferReferenceLayerPage offerId={offerId} layer="timeline" />;
}
