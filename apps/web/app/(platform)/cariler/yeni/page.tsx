import { CustomerCreateReferenceLayout } from "../../../../src/features/customers/components/CustomerCreateReferenceLayout";
import { CarilerYeniCommandCenterShell } from "../../../../src/features/ui-inventory/components/CarilerShellWrappers";

export default function CarilerYeniPage() {
  return (
    <CarilerYeniCommandCenterShell>
      <CustomerCreateReferenceLayout />
    </CarilerYeniCommandCenterShell>
  );
}
