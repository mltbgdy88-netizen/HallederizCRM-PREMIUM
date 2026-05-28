"use client";

import { InventoryCommandCenterPage } from "./InventoryCommandCenterPage";
import {
  buildCustomerLayerConfig,
  LISTE_CONFIG,
  type CustomerLayerKey
} from "../utils/cariler-subroute-command-center-data";

export function CarilerListeCommandCenterPage() {
  return <InventoryCommandCenterPage config={LISTE_CONFIG} />;
}

function CustomerLayerPage({ layer, customerId }: { layer: CustomerLayerKey; customerId: string }) {
  const config = buildCustomerLayerConfig(layer, customerId);
  return <InventoryCommandCenterPage config={config} />;
}

export function CarilerCustomeridOzetCommandCenterPage({ customerId }: { customerId: string }) {
  return <CustomerLayerPage layer="ozet" customerId={customerId} />;
}

export function CarilerCustomeridIletisimCommandCenterPage({ customerId }: { customerId: string }) {
  return <CustomerLayerPage layer="iletisim" customerId={customerId} />;
}

export function CarilerCustomeridFinansCommandCenterPage({ customerId }: { customerId: string }) {
  return <CustomerLayerPage layer="finans" customerId={customerId} />;
}

export function CarilerCustomeridTekliflerCommandCenterPage({ customerId }: { customerId: string }) {
  return <CustomerLayerPage layer="teklifler" customerId={customerId} />;
}

export function CarilerCustomeridSiparislerCommandCenterPage({ customerId }: { customerId: string }) {
  return <CustomerLayerPage layer="siparisler" customerId={customerId} />;
}

export function CarilerCustomeridTahsilatlarCommandCenterPage({ customerId }: { customerId: string }) {
  return <CustomerLayerPage layer="tahsilatlar" customerId={customerId} />;
}

export function CarilerCustomeridTimelineCommandCenterPage({ customerId }: { customerId: string }) {
  return <CustomerLayerPage layer="timeline" customerId={customerId} />;
}
