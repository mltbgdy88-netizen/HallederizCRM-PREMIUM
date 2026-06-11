import { SiparislerOrderidOdemeTahsilatCommandCenterPage } from "../../../../../src/features/ui-inventory/components/SiparislerSubRoutePages";

export default function SiparislerOrderOdemeTahsilatPage({ params }: { params: { orderId: string } }) {
  return <SiparislerOrderidOdemeTahsilatCommandCenterPage orderId={params.orderId} />;
}
