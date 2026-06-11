import { notFound } from "next/navigation";
import { TaskDetailPage } from "../../../../src/features/tasks/components";
import { getTaskById } from "../../../../src/features/dashboard/queries";

export default async function TaskDetailRoutePage({ params }: { params: Promise<{ taskId: string }> }) {
  const resolvedParams = await params;
  const task = await getTaskById(resolvedParams.taskId);

  if (!task) {
    notFound();
  }

  return <TaskDetailPage task={task} />;
}
