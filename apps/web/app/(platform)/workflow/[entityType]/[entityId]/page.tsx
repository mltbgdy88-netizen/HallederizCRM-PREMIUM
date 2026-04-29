import { notFound } from "next/navigation";
import { WorkflowTimelinePage } from "../../../../../src/features/workflows/components";
import { getWorkflowByEntity } from "../../../../../src/features/dashboard/queries";

export default async function WorkflowRoutePage({ params }: { params: { entityType: string; entityId: string } }) {
  const workflow = await getWorkflowByEntity(params.entityType, params.entityId);

  if (!workflow) {
    notFound();
  }

  return <WorkflowTimelinePage workflow={workflow} />;
}
