import { FactoryOrderDetailPage as FactoryOrderDetailFeaturePage } from "../../../../../src/features/factories/components";

export default async function FactoryOrderDetailPage({
  params
}: {
  params: Promise<{ factoryOrderId: string }>;
}) {
  const { factoryOrderId } = await params;
  return <FactoryOrderDetailFeaturePage factoryOrderId={factoryOrderId} />;
}
