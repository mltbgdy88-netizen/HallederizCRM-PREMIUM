import { ReturnDetailPage as ReturnDetailFeaturePage } from "../../../../src/features/returns/components";

export default function ReturnDetailPage({ params }: { params: { returnId: string } }) {
  return <ReturnDetailFeaturePage returnId={params.returnId} />;
}
