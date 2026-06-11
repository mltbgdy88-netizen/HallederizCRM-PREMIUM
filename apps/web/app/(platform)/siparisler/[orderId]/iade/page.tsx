import { SiparislerOrderidIadeCommandCenterPage } from "../../../../../src/features/ui-inventory/components/SiparislerSubRoutePages";

export default function SiparislerOrderIadePage({ params }: { params: { orderId: string } }) {
  return <SiparislerOrderidIadeCommandCenterPage orderId={params.orderId} />;
}
