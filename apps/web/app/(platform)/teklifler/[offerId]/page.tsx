import { OfferDetailPage as OfferDetailFeaturePage } from "../../../../src/features/offers/components";
import { OfferEntityLayerNav } from "../../../../src/features/ui-inventory/components/EntityLayerNav";
import { TekliflerOfferidCommandCenterShell } from "../../../../src/features/ui-inventory/components/TekliflerShellWrappers";

export default function OfferDetailPage({ params }: { params: { offerId: string } }) {
  return (
    <TekliflerOfferidCommandCenterShell>
      <OfferEntityLayerNav offerId={params.offerId} />
      <OfferDetailFeaturePage offerId={params.offerId} />
    </TekliflerOfferidCommandCenterShell>
  );
}
