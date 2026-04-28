import { FactoryOrdersPage as FactoryOrdersFeaturePage } from "../../../../src/features/factories/components";
import { getFactoryOrderData } from "../../../../src/features/factories/queries";

export default async function FactoryOrdersPage() {
  const data = await getFactoryOrderData();
  return <FactoryOrdersFeaturePage orders={data.orders} />;
}
