import { OrderCreateHub } from "../../../../src/features/orders/components/OrderCreateHub";
import { SiparislerYeniCommandCenterShell } from "../../../../src/features/ui-inventory/components/SiparislerShellWrappers";

export default function NewOrderPage({
  searchParams
}: {
  searchParams?: { sourceOffer?: string; customer?: string; offer?: string };
}) {
  const sourceOfferId = searchParams?.sourceOffer ?? searchParams?.offer ?? null;

  return (
    <SiparislerYeniCommandCenterShell>
      <OrderCreateHub customerId={searchParams?.customer ?? null} sourceOfferId={sourceOfferId} />
    </SiparislerYeniCommandCenterShell>
  );
}
