import { notFound } from "next/navigation";
import { WorkflowTimelinePage } from "../../../../../src/features/workflows/components";
import { getWorkflowByEntity } from "../../../../../src/features/dashboard/queries";

export default async function WorkflowRoutePage({ params }: { params: Promise<{ entityType: string; entityId: string }> }) {
  const resolvedParams = await params;
  const workflow = await getWorkflowByEntity(resolvedParams.entityType, resolvedParams.entityId);

  if (!workflow) {
    notFound();
  }

  return <WorkflowTimelinePage workflow={workflow} />;
}
