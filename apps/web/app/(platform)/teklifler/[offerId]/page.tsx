import { OfferDetailPage as OfferDetailFeaturePage } from "../../../../src/features/offers/components";
import { OfferEntityLayerNav } from "../../../../src/features/ui-inventory/components/EntityLayerNav";
import { TekliflerOfferidCommandCenterShell } from "../../../../src/features/ui-inventory/components/TekliflerShellWrappers";

export default async function OfferDetailPage({ params }: { params: Promise<{ offerId: string }> }) {
  const resolvedParams = await params;
  return (
    <TekliflerOfferidCommandCenterShell>
      <OfferEntityLayerNav offerId={resolvedParams.offerId} />
      <OfferDetailFeaturePage offerId={resolvedParams.offerId} />
    </TekliflerOfferidCommandCenterShell>
  );
}
