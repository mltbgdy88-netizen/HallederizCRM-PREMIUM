import { TekliflerOfferidSipariseDonusturmeCommandCenterPage } from "../../../../../src/features/ui-inventory/components/TekliflerSubRoutePages";

export default async function TekliflerOfferSipariseDonusturmePage({ params }: { params: Promise<{ offerId: string }> }) {
  const resolvedParams = await params;
  return <TekliflerOfferidSipariseDonusturmeCommandCenterPage offerId={resolvedParams.offerId} />;
}
