import { TekliflerOfferidOzetCommandCenterPage } from "../../../../../src/features/ui-inventory/components/TekliflerSubRoutePages";

export default async function TekliflerOfferOzetPage({ params }: { params: Promise<{ offerId: string }> }) {
  const resolvedParams = await params;
  return <TekliflerOfferidOzetCommandCenterPage offerId={resolvedParams.offerId} />;
}
