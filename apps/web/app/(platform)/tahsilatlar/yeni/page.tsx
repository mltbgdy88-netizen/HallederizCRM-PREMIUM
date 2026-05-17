import { PaymentCreateHub } from "../../../../src/features/payments/components/PaymentCreateHub";

export default function NewPaymentPage({ searchParams }: { searchParams?: { customer?: string; order?: string } }) {
  return (
    <PaymentCreateHub
      customerId={searchParams?.customer ?? null}
      sourceOrderId={searchParams?.order ?? null}
    />
  );
}
