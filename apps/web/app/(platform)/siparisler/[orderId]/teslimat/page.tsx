import { SiparislerOrderidTeslimatCommandCenterPage } from "../../../../../src/features/ui-inventory/components/SiparislerSubRoutePages";

export default async function SiparislerOrderTeslimatPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = await params;
  return <SiparislerOrderidTeslimatCommandCenterPage orderId={resolvedParams.orderId} />;
}
