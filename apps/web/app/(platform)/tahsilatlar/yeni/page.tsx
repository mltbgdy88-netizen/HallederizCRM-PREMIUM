import { PaymentCreatePage } from "../../../../src/features/payments/components/PaymentCreatePage";

export default function NewPaymentPage({ searchParams }: { searchParams?: { customer?: string; order?: string } }) {
  return (
    <PaymentCreatePage
      customerId={searchParams?.customer ?? null}
      sourceOrderId={searchParams?.order ?? null}
    />
  );
}
