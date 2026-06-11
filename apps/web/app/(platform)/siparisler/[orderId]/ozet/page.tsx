import { SiparislerOrderidOzetCommandCenterPage } from "../../../../../src/features/ui-inventory/components/SiparislerSubRoutePages";

export default async function SiparislerOrderOzetPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = await params;
  return <SiparislerOrderidOzetCommandCenterPage orderId={resolvedParams.orderId} />;
}
