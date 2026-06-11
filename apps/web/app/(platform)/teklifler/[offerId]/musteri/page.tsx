import { TekliflerOfferidMusteriCommandCenterPage } from "../../../../../src/features/ui-inventory/components/TekliflerSubRoutePages";

export default function TekliflerOfferMusteriPage({ params }: { params: { offerId: string } }) {
  return <TekliflerOfferidMusteriCommandCenterPage offerId={params.offerId} />;
}
