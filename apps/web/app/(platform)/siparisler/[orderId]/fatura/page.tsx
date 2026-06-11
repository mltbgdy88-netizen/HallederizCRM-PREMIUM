import { SiparislerOrderidFaturaCommandCenterPage } from "../../../../../src/features/ui-inventory/components/SiparislerSubRoutePages";

export default function SiparislerOrderFaturaPage({ params }: { params: { orderId: string } }) {
  return <SiparislerOrderidFaturaCommandCenterPage orderId={params.orderId} />;
}
