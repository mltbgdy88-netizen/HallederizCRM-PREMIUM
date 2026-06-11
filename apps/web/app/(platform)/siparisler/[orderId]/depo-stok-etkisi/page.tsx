import { SiparislerOrderidDepoStokEtkisiCommandCenterPage } from "../../../../../src/features/ui-inventory/components/SiparislerSubRoutePages";

export default function SiparislerOrderDepoStokEtkisiPage({ params }: { params: { orderId: string } }) {
  return <SiparislerOrderidDepoStokEtkisiCommandCenterPage orderId={params.orderId} />;
}
