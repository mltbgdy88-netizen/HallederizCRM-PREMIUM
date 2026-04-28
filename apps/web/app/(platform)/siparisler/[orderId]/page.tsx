import { OrderDetailPage as OrderDetailFeaturePage } from "../../../../src/features/orders/components";

export default function OrderDetailPage({ params }: { params: { orderId: string } }) {
  return <OrderDetailFeaturePage orderId={params.orderId} />;
}
