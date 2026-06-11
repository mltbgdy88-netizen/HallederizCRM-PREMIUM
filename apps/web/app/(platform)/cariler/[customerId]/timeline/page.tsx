import { CustomerLayerReferenceLayout } from "../../../../../src/features/customers/components/CustomerLayerReferenceLayout";

export default function CarilerCustomerTimelinePage({ params }: { params: { customerId: string } }) {
  return <CustomerLayerReferenceLayout customerId={params.customerId} layer="timeline" />;
}
