import { OrderDetailPage as OrderDetailFeaturePage } from "../../../../src/features/orders/components";
import { OrderEntityLayerNav } from "../../../../src/features/ui-inventory/components/EntityLayerNav";
import { SiparislerOrderidCommandCenterShell } from "../../../../src/features/ui-inventory/components/SiparislerShellWrappers";

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = await params;
  return (
    <SiparislerOrderidCommandCenterShell>
      <OrderEntityLayerNav orderId={resolvedParams.orderId} />
      <OrderDetailFeaturePage orderId={resolvedParams.orderId} />
    </SiparislerOrderidCommandCenterShell>
  );
}
