import { DeliveryCreatePage } from "../../../../src/features/deliveries/components/DeliveryCreatePage";

export default async function TeslimatlarYeniPage({ searchParams }: { searchParams?: Promise<{ order?: string }> }) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  return <DeliveryCreatePage sourceOrderId={resolvedSearchParams?.order ?? null} />;
}
