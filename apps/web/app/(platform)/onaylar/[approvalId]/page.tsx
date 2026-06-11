import { notFound } from "next/navigation";
import { ApprovalDetailReferenceLayout } from "../../../../src/features/approvals/components/ApprovalDetailReferenceLayout";
import { getApprovalById } from "../../../../src/features/dashboard/queries";

export default async function ApprovalDetailRoutePage({ params }: { params: { approvalId: string } }) {
  const approval = await getApprovalById(params.approvalId);

  if (!approval) {
    notFound();
  }

  return <ApprovalDetailReferenceLayout approval={approval} />;
}
