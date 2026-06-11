"use client";

import { OrderReferenceLayerPage } from "../../orders/components/OrderReferenceLayerPage";
import { InventoryCommandCenterPage } from "./InventoryCommandCenterPage";
import { LISTE_CONFIG } from "../utils/siparisler-subroute-command-center-data";

export function SiparislerListeCommandCenterPage() {
  return <InventoryCommandCenterPage config={LISTE_CONFIG} />;
}

export function SiparislerOrderidOzetCommandCenterPage({ orderId }: { orderId: string }) {
  return <OrderReferenceLayerPage orderId={orderId} layer="ozet" />;
}

export function SiparislerOrderidSatirlarCommandCenterPage({ orderId }: { orderId: string }) {
  return <OrderReferenceLayerPage orderId={orderId} layer="satirlar" />;
}

export function SiparislerOrderidOdemeTahsilatCommandCenterPage({ orderId }: { orderId: string }) {
  return <OrderReferenceLayerPage orderId={orderId} layer="odeme-tahsilat" />;
}

export function SiparislerOrderidTeslimatCommandCenterPage({ orderId }: { orderId: string }) {
  return <OrderReferenceLayerPage orderId={orderId} layer="teslimat" />;
}

export function SiparislerOrderidFaturaCommandCenterPage({ orderId }: { orderId: string }) {
  return <OrderReferenceLayerPage orderId={orderId} layer="fatura" />;
}

export function SiparislerOrderidIadeCommandCenterPage({ orderId }: { orderId: string }) {
  return <OrderReferenceLayerPage orderId={orderId} layer="iade" />;
}

export function SiparislerOrderidDepoStokEtkisiCommandCenterPage({ orderId }: { orderId: string }) {
  return <OrderReferenceLayerPage orderId={orderId} layer="depo-stok-etkisi" />;
}

export function SiparislerOrderidTimelineCommandCenterPage({ orderId }: { orderId: string }) {
  return <OrderReferenceLayerPage orderId={orderId} layer="timeline" />;
}
