import { SiparislerOrderidSatirlarCommandCenterPage } from "../../../../../src/features/ui-inventory/components/SiparislerSubRoutePages";

export default function SiparislerOrderSatirlarPage({ params }: { params: { orderId: string } }) {
  return <SiparislerOrderidSatirlarCommandCenterPage orderId={params.orderId} />;
}
