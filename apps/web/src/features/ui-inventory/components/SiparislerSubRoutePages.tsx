"use client";

import { InventoryCommandCenterPage } from "./InventoryCommandCenterPage";
import {
  buildOrderLayerConfig,
  LISTE_CONFIG,
  type OrderLayerKey
} from "../utils/siparisler-subroute-command-center-data";

export function SiparislerListeCommandCenterPage() {
  return <InventoryCommandCenterPage config={LISTE_CONFIG} />;
}

function OrderLayerPage({ layer, orderId }: { layer: OrderLayerKey; orderId: string }) {
  const config = buildOrderLayerConfig(layer, orderId);
  return <InventoryCommandCenterPage config={config} />;
}

export function SiparislerOrderidOzetCommandCenterPage({ orderId }: { orderId: string }) {
  return <OrderLayerPage layer="ozet" orderId={orderId} />;
}

export function SiparislerOrderidSatirlarCommandCenterPage({ orderId }: { orderId: string }) {
  return <OrderLayerPage layer="satirlar" orderId={orderId} />;
}

export function SiparislerOrderidOdemeTahsilatCommandCenterPage({ orderId }: { orderId: string }) {
  return <OrderLayerPage layer="odeme-tahsilat" orderId={orderId} />;
}

export function SiparislerOrderidTeslimatCommandCenterPage({ orderId }: { orderId: string }) {
  return <OrderLayerPage layer="teslimat" orderId={orderId} />;
}

export function SiparislerOrderidFaturaCommandCenterPage({ orderId }: { orderId: string }) {
  return <OrderLayerPage layer="fatura" orderId={orderId} />;
}

export function SiparislerOrderidIadeCommandCenterPage({ orderId }: { orderId: string }) {
  return <OrderLayerPage layer="iade" orderId={orderId} />;
}

export function SiparislerOrderidDepoStokEtkisiCommandCenterPage({ orderId }: { orderId: string }) {
  return <OrderLayerPage layer="depo-stok-etkisi" orderId={orderId} />;
}

export function SiparislerOrderidTimelineCommandCenterPage({ orderId }: { orderId: string }) {
  return <OrderLayerPage layer="timeline" orderId={orderId} />;
}
