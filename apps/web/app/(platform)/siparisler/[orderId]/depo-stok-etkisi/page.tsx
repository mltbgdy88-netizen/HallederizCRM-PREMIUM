import { SiparislerOrderidDepoStokEtkisiCommandCenterPage } from "../../../../../src/features/ui-inventory/components/SiparislerSubRoutePages";

export default async function SiparislerOrderDepoStokEtkisiPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = await params;
  return <SiparislerOrderidDepoStokEtkisiCommandCenterPage orderId={resolvedParams.orderId} />;
}
