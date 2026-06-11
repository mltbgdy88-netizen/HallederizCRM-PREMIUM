import { CustomerDetailReferenceLayout } from "../../../../src/features/customers/components/CustomerDetailReferenceLayout";

export default function CustomerDetailPage({ params }: { params: { customerId: string } }) {
  return <CustomerDetailReferenceLayout customerId={params.customerId} />;
}
