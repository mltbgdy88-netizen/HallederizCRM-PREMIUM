import { OfferCreateHub } from "../../../../src/features/offers/components/OfferCreateHub";

export default function NewOfferPage({ searchParams }: { searchParams?: { customer?: string } }) {
  return <OfferCreateHub customerId={searchParams?.customer ?? null} />;
}
