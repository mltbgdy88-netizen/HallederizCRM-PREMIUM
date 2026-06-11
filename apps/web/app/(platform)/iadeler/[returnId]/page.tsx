import { ReturnDetailPage } from "../../../../src/features/returns/components";

export default async function ReturnDetailRoute({ params }: { params: Promise<{ returnId: string }> }) {
  const resolvedParams = await params;
  return <ReturnDetailPage returnId={resolvedParams.returnId} />;
}
