import { OfferCreateHub } from "../../../../src/features/offers/components/OfferCreateHub";
import { TekliflerYeniCommandCenterShell } from "../../../../src/features/ui-inventory/components/TekliflerShellWrappers";

export default async function NewOfferPage({ searchParams }: { searchParams?: Promise<{ customer?: string }> }) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  return (
    <TekliflerYeniCommandCenterShell>
      <OfferCreateHub customerId={resolvedSearchParams?.customer ?? null} />
    </TekliflerYeniCommandCenterShell>
  );
}
