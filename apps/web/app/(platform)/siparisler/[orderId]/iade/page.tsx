import { SiparislerOrderidIadeCommandCenterPage } from "../../../../../src/features/ui-inventory/components/SiparislerSubRoutePages";

export default async function SiparislerOrderIadePage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = await params;
  return <SiparislerOrderidIadeCommandCenterPage orderId={resolvedParams.orderId} />;
}
