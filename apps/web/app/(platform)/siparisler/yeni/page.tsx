import { OrderCreateHub } from "../../../../src/features/orders/components/OrderCreateHub";
import { SiparislerYeniCommandCenterShell } from "../../../../src/features/ui-inventory/components/SiparislerShellWrappers";

export default async function NewOrderPage({
  searchParams
}: {
  searchParams?: Promise<{ sourceOffer?: string; customer?: string; offer?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const sourceOfferId = resolvedSearchParams?.sourceOffer ?? resolvedSearchParams?.offer ?? null;

  return (
    <SiparislerYeniCommandCenterShell>
      <OrderCreateHub customerId={resolvedSearchParams?.customer ?? null} sourceOfferId={sourceOfferId} />
    </SiparislerYeniCommandCenterShell>
  );
}
