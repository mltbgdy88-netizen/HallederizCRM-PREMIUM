import { SiparislerOrderidSatirlarCommandCenterPage } from "../../../../../src/features/ui-inventory/components/SiparislerSubRoutePages";

export default async function SiparislerOrderSatirlarPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = await params;
  return <SiparislerOrderidSatirlarCommandCenterPage orderId={resolvedParams.orderId} />;
}
