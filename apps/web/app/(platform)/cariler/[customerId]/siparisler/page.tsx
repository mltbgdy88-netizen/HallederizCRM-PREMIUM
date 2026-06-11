import { CustomerLayerReferenceLayout } from "../../../../../src/features/customers/components/CustomerLayerReferenceLayout";

export default function CarilerCustomerSiparislerPage({ params }: { params: { customerId: string } }) {
  return <CustomerLayerReferenceLayout customerId={params.customerId} layer="siparisler" />;
}
