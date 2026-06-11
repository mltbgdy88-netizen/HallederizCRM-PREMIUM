import { TekliflerOfferidTimelineCommandCenterPage } from "../../../../../src/features/ui-inventory/components/TekliflerSubRoutePages";

export default async function TekliflerOfferTimelinePage({ params }: { params: Promise<{ offerId: string }> }) {
  const resolvedParams = await params;
  return <TekliflerOfferidTimelineCommandCenterPage offerId={resolvedParams.offerId} />;
}
