import { notFound } from "next/navigation";
import { FactoryOrderDetailPage as FactoryOrderDetailFeaturePage } from "../../../../../src/features/factories/components";
import { getFactoryOrderById } from "../../../../../src/features/factories/queries";

export default async function FactoryOrderDetailPage({ params }: { params: { factoryOrderId: string } }) {
  const data = await getFactoryOrderById(params.factoryOrderId);
  if (!data.order) {
    notFound();
  }

  return <FactoryOrderDetailFeaturePage order={data.order} logs={data.logs} />;
}
