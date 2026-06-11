import { TekliflerOfferidSatirlarCommandCenterPage } from "../../../../../src/features/ui-inventory/components/TekliflerSubRoutePages";

export default function TekliflerOfferSatirlarPage({ params }: { params: { offerId: string } }) {
  return <TekliflerOfferidSatirlarCommandCenterPage offerId={params.offerId} />;
}
