import { ReturnDetailPage } from "../../../../src/features/returns/components";

export default function ReturnDetailRoute({ params }: { params: { returnId: string } }) {
  return <ReturnDetailPage returnId={params.returnId} />;
}
