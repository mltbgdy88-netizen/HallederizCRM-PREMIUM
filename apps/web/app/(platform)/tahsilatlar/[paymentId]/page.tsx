import { PaymentDetailPage as PaymentDetailFeaturePage } from "../../../../src/features/payments/components";

export default function PaymentDetailPage({ params }: { params: { paymentId: string } }) {
  return <PaymentDetailFeaturePage paymentId={params.paymentId} />;
}
