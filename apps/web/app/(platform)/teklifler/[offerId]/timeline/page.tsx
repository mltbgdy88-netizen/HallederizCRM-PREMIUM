import { TekliflerOfferidTimelineCommandCenterPage } from "../../../../../src/features/ui-inventory/components/TekliflerSubRoutePages";

export default function TekliflerOfferTimelinePage({ params }: { params: { offerId: string } }) {
  return <TekliflerOfferidTimelineCommandCenterPage offerId={params.offerId} />;
}
