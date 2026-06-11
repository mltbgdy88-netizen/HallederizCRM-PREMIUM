import { OfferCreateHub } from "../../../../src/features/offers/components/OfferCreateHub";
import { TekliflerYeniCommandCenterShell } from "../../../../src/features/ui-inventory/components/TekliflerShellWrappers";

export default function NewOfferPage({ searchParams }: { searchParams?: { customer?: string } }) {
  return (
    <TekliflerYeniCommandCenterShell>
      <OfferCreateHub customerId={searchParams?.customer ?? null} />
    </TekliflerYeniCommandCenterShell>
  );
}
