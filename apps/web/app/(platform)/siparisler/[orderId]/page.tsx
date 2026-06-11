import { OrderDetailPage as OrderDetailFeaturePage } from "../../../../src/features/orders/components";
import { OrderEntityLayerNav } from "../../../../src/features/ui-inventory/components/EntityLayerNav";
import { SiparislerOrderidCommandCenterShell } from "../../../../src/features/ui-inventory/components/SiparislerShellWrappers";

export default function OrderDetailPage({ params }: { params: { orderId: string } }) {
  return (
    <SiparislerOrderidCommandCenterShell>
      <OrderEntityLayerNav orderId={params.orderId} />
      <OrderDetailFeaturePage orderId={params.orderId} />
    </SiparislerOrderidCommandCenterShell>
  );
}
