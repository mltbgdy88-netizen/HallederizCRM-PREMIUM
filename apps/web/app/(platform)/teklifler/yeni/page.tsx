import { OfferDetailPage } from "../../../../src/features/offers/components";

export default function NewOfferPage({ searchParams }: { searchParams?: { customer?: string } }) {
  return <OfferDetailPage customerId={searchParams?.customer ?? null} />;
}
