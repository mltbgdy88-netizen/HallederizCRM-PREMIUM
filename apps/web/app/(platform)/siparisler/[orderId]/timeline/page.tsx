import { SiparislerOrderidTimelineCommandCenterPage } from "../../../../../src/features/ui-inventory/components/SiparislerSubRoutePages";

export default async function SiparislerOrderTimelinePage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = await params;
  return <SiparislerOrderidTimelineCommandCenterPage orderId={resolvedParams.orderId} />;
}
