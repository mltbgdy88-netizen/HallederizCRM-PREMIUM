import { CustomerDetailPage as CustomerDetailFeaturePage } from "../../../../src/features/customers/components";

export default function CustomerDetailPage({ params }: { params: { customerId: string } }) {
  return <CustomerDetailFeaturePage customerId={params.customerId} />;
}
