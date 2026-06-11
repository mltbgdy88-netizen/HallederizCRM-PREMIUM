import { SiparislerOrderidOdemeTahsilatCommandCenterPage } from "../../../../../src/features/ui-inventory/components/SiparislerSubRoutePages";

export default async function SiparislerOrderOdemeTahsilatPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = await params;
  return <SiparislerOrderidOdemeTahsilatCommandCenterPage orderId={resolvedParams.orderId} />;
}
