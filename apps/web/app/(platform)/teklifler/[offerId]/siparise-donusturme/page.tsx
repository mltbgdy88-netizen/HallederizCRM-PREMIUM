import { TekliflerOfferidSipariseDonusturmeCommandCenterPage } from "../../../../../src/features/ui-inventory/components/TekliflerSubRoutePages";

export default function TekliflerOfferSipariseDonusturmePage({ params }: { params: { offerId: string } }) {
  return <TekliflerOfferidSipariseDonusturmeCommandCenterPage offerId={params.offerId} />;
}
