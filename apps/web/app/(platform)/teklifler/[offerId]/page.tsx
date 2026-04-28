import { OfferDetailPage as OfferDetailFeaturePage } from "../../../../src/features/offers/components";

export default function OfferDetailPage({ params }: { params: { offerId: string } }) {
  return <OfferDetailFeaturePage offerId={params.offerId} />;
}
