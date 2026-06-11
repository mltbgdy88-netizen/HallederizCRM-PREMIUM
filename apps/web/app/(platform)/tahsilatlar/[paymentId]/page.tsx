import { PaymentDetailPage } from "../../../../src/features/payments/components/PaymentDetailPage";

export default function PaymentDetailRoute({ params }: { params: { paymentId: string } }) {
  return <PaymentDetailPage paymentId={params.paymentId} />;
}
