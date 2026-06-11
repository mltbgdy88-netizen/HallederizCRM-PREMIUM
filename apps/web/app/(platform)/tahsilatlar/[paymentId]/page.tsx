import { PaymentDetailPage } from "../../../../src/features/payments/components/PaymentDetailPage";

export default async function PaymentDetailRoute({ params }: { params: Promise<{ paymentId: string }> }) {
  const resolvedParams = await params;
  return <PaymentDetailPage paymentId={resolvedParams.paymentId} />;
}
