import { TekliflerOfferidOzetCommandCenterPage } from "../../../../../src/features/ui-inventory/components/TekliflerSubRoutePages";

export default function TekliflerOfferOzetPage({ params }: { params: { offerId: string } }) {
  return <TekliflerOfferidOzetCommandCenterPage offerId={params.offerId} />;
}
