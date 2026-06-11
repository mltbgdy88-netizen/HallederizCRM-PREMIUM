import { TekliflerOfferidMusteriCommandCenterPage } from "../../../../../src/features/ui-inventory/components/TekliflerSubRoutePages";

export default async function TekliflerOfferMusteriPage({ params }: { params: Promise<{ offerId: string }> }) {
  const resolvedParams = await params;
  return <TekliflerOfferidMusteriCommandCenterPage offerId={resolvedParams.offerId} />;
}
