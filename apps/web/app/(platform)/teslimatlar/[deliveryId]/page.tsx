import { DeliveryDetailPage } from "../../../../src/features/deliveries/components";

export default function DeliveryDetailRoute({ params }: { params: { deliveryId: string } }) {
  return <DeliveryDetailPage deliveryId={params.deliveryId} />;
}
