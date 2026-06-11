import { CustomerLayerReferenceLayout } from "../../../../../src/features/customers/components/CustomerLayerReferenceLayout";

export default async function CarilerCustomerTahsilatlarPage({ params }: { params: Promise<{ customerId: string }> }) {
  const resolvedParams = await params;
  return <CustomerLayerReferenceLayout customerId={resolvedParams.customerId} layer="tahsilatlar" />;
}
