import { DeliveryDetailPage } from "../../../../src/features/deliveries/components";

export default async function DeliveryDetailRoute({ params }: { params: Promise<{ deliveryId: string }> }) {
  const resolvedParams = await params;
  return <DeliveryDetailPage deliveryId={resolvedParams.deliveryId} />;
}
