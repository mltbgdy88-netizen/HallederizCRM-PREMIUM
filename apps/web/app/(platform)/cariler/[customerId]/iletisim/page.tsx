import { CustomerLayerReferenceLayout } from "../../../../../src/features/customers/components/CustomerLayerReferenceLayout";

export default async function CarilerCustomerIletisimPage({ params }: { params: Promise<{ customerId: string }> }) {
  const resolvedParams = await params;
  return <CustomerLayerReferenceLayout customerId={resolvedParams.customerId} layer="iletisim" />;
}
