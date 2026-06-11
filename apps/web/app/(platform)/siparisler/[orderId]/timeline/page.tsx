import { SiparislerOrderidTimelineCommandCenterPage } from "../../../../../src/features/ui-inventory/components/SiparislerSubRoutePages";

export default function SiparislerOrderTimelinePage({ params }: { params: { orderId: string } }) {
  return <SiparislerOrderidTimelineCommandCenterPage orderId={params.orderId} />;
}
