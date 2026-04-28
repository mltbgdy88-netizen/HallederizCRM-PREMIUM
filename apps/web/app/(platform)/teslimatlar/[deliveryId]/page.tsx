import { DeliveryDetailPage as DeliveryDetailFeaturePage } from "../../../../src/features/deliveries/components";

export default function DeliveryDetailPage({ params }: { params: { deliveryId: string } }) {
  return <DeliveryDetailFeaturePage deliveryId={params.deliveryId} />;
}
