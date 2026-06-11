import { TekliflerOfferidBelgelerCommandCenterPage } from "../../../../../src/features/ui-inventory/components/TekliflerSubRoutePages";

export default async function TekliflerOfferBelgelerPage({ params }: { params: Promise<{ offerId: string }> }) {
  const resolvedParams = await params;
  return <TekliflerOfferidBelgelerCommandCenterPage offerId={resolvedParams.offerId} />;
}
