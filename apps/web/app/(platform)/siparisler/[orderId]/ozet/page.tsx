import { SiparislerOrderidOzetCommandCenterPage } from "../../../../../src/features/ui-inventory/components/SiparislerSubRoutePages";

export default function SiparislerOrderOzetPage({ params }: { params: { orderId: string } }) {
  return <SiparislerOrderidOzetCommandCenterPage orderId={params.orderId} />;
}
