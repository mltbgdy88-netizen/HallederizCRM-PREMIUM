import { WarehouseOrderDetailPage as WarehouseOrderDetailFeaturePage } from "../../../../../src/features/warehouse/components";

export default async function WarehouseOrderDetailPage({ params }: { params: Promise<{ warehouseOrderId: string }> }) {
  const resolvedParams = await params;
  return <WarehouseOrderDetailFeaturePage warehouseOrderId={resolvedParams.warehouseOrderId} />;
}
