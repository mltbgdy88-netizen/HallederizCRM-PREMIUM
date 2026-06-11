import { notFound } from "next/navigation";
import { FactoryOrderDetailPage as FactoryOrderDetailFeaturePage } from "../../../../../src/features/factories/components";
import { getFactoryOrderById } from "../../../../../src/features/factories/queries";

export default async function FactoryOrderDetailPage({ params }: { params: Promise<{ factoryOrderId: string }> }) {
  const resolvedParams = await params;
  const data = await getFactoryOrderById(resolvedParams.factoryOrderId);
  if (!data.order) {
    notFound();
  }

  return <FactoryOrderDetailFeaturePage order={data.order} logs={data.logs} />;
}
