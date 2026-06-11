import { CustomerDetailReferenceLayout } from "../../../../src/features/customers/components/CustomerDetailReferenceLayout";

export default async function CustomerDetailPage({ params }: { params: Promise<{ customerId: string }> }) {
  const resolvedParams = await params;
  return <CustomerDetailReferenceLayout customerId={resolvedParams.customerId} />;
}
