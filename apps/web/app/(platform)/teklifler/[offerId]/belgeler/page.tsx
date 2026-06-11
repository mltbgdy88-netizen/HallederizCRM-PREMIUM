import { TekliflerOfferidBelgelerCommandCenterPage } from "../../../../../src/features/ui-inventory/components/TekliflerSubRoutePages";

export default function TekliflerOfferBelgelerPage({ params }: { params: { offerId: string } }) {
  return <TekliflerOfferidBelgelerCommandCenterPage offerId={params.offerId} />;
}
