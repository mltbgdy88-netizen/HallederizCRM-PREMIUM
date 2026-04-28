import { TaskDetailPage } from "../../../../src/features/tasks/components";
import { getTaskById } from "../../../../src/features/dashboard/queries";

export default async function TaskDetailRoutePage({ params }: { params: { taskId: string } }) {
  const task = await getTaskById(params.taskId);

  if (!task) {
    return null;
  }

  return <TaskDetailPage task={task} />;
}
