import { FactoryStocksPage as FactoryStocksFeaturePage } from "../../../../src/features/factories/components";
import { getFactoryStockData } from "../../../../src/features/factories/queries";

export default async function FactoryStocksPage() {
  const data = await getFactoryStockData();
  return <FactoryStocksFeaturePage data={data} />;
}
