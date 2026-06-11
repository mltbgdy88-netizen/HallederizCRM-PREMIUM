import { PaymentCreatePage } from "../../../../src/features/payments/components/PaymentCreatePage";

export default async function NewPaymentPage({ searchParams }: { searchParams?: Promise<{ customer?: string; order?: string }> }) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  return (
    <PaymentCreatePage
      customerId={resolvedSearchParams?.customer ?? null}
      sourceOrderId={resolvedSearchParams?.order ?? null}
    />
  );
}
