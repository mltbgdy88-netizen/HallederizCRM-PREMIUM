import { DeliveryCreatePage } from "../../../../src/features/deliveries/components/DeliveryCreatePage";

export default function TeslimatlarYeniPage({ searchParams }: { searchParams?: { order?: string } }) {
  return <DeliveryCreatePage sourceOrderId={searchParams?.order ?? null} />;
}
