import { OrderDetailPage as OrderDetailFeaturePage } from "../../../../src/features/orders/components";

export default function NewOrderPage({ searchParams }: { searchParams?: { sourceOffer?: string; customer?: string } }) {
  return <OrderDetailFeaturePage sourceOfferId={searchParams?.sourceOffer ?? null} customerId={searchParams?.customer ?? null} />;
}
