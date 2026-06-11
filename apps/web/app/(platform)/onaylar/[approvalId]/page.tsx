import { notFound } from "next/navigation";
import { ApprovalDetailReferenceLayout } from "../../../../src/features/approvals/components/ApprovalDetailReferenceLayout";
import { getApprovalById } from "../../../../src/features/dashboard/queries";

export default async function ApprovalDetailRoutePage({ params }: { params: Promise<{ approvalId: string }> }) {
  const resolvedParams = await params;
  const approval = await getApprovalById(resolvedParams.approvalId);

  if (!approval) {
    notFound();
  }

  return <ApprovalDetailReferenceLayout approval={approval} />;
}
