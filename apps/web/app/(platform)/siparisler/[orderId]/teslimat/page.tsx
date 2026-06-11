import { SiparislerOrderidTeslimatCommandCenterPage } from "../../../../../src/features/ui-inventory/components/SiparislerSubRoutePages";

export default function SiparislerOrderTeslimatPage({ params }: { params: { orderId: string } }) {
  return <SiparislerOrderidTeslimatCommandCenterPage orderId={params.orderId} />;
}
