import { ApprovalDetailPage } from "../../../../src/features/approvals/components";
import { getApprovalById } from "../../../../src/features/dashboard/queries";

export default async function ApprovalDetailRoutePage({ params }: { params: { approvalId: string } }) {
  const approval = await getApprovalById(params.approvalId);

  if (!approval) {
    return null;
  }

  return <ApprovalDetailPage approval={approval} />;
}
