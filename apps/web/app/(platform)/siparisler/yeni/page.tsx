import { OrderCreateHub } from "../../../../src/features/orders/components/OrderCreateHub";

export default function NewOrderPage({ searchParams }: { searchParams?: { sourceOffer?: string; customer?: string } }) {
  return (
    <OrderCreateHub
      customerId={searchParams?.customer ?? null}
      sourceOfferId={searchParams?.sourceOffer ?? null}
    />
  );
}
