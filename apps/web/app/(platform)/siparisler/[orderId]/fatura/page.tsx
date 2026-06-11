import { SiparislerOrderidFaturaCommandCenterPage } from "../../../../../src/features/ui-inventory/components/SiparislerSubRoutePages";

export default async function SiparislerOrderFaturaPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = await params;
  return <SiparislerOrderidFaturaCommandCenterPage orderId={resolvedParams.orderId} />;
}
