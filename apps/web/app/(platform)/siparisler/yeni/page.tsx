import { OrderDetailPage as OrderDetailFeaturePage } from "../../../../src/features/orders/components";

export default function NewOrderPage({ searchParams }: { searchParams?: { sourceOffer?: string } }) {
  return <OrderDetailFeaturePage sourceOfferId={searchParams?.sourceOffer ?? null} />;
}
