import { TekliflerOfferidSatirlarCommandCenterPage } from "../../../../../src/features/ui-inventory/components/TekliflerSubRoutePages";

export default async function TekliflerOfferSatirlarPage({ params }: { params: Promise<{ offerId: string }> }) {
  const resolvedParams = await params;
  return <TekliflerOfferidSatirlarCommandCenterPage offerId={resolvedParams.offerId} />;
}
