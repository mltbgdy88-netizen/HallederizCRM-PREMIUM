import { WarehouseOrderDetailPage as WarehouseOrderDetailFeaturePage } from "../../../../../src/features/warehouse/components";

export default function WarehouseOrderDetailPage({ params }: { params: { warehouseOrderId: string } }) {
  return <WarehouseOrderDetailFeaturePage warehouseOrderId={params.warehouseOrderId} />;
}
