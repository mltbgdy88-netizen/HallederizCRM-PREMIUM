"use client";

import type { Task } from "@hallederiz/types";
import { buildTaskNavigationTarget } from "@hallederiz/domain";
import { useRouter } from "next/navigation";

const priorityLabels: Record<Task["priority"], string> = { low: "Dusuk", normal: "Normal", high: "Yuksek", critical: "Kritik" };
const statusLabels: Record<Task["status"], string> = { open: "Acik", in_progress: "Devam", done: "Tamam", cancelled: "Iptal", overdue: "Gecikti" };

function badgeClass(priority: Task["priority"]) {
  if (priority === "critical") return "hz-badge hz-badge-danger";
  if (priority === "high") return "hz-badge hz-badge-warning";
  return "hz-badge hz-badge-info";
}

export function TaskQuickActions({ task }: { task: Task }) {
  const router = useRouter();
  const target = buildTaskNavigationTarget(task);
  return (
    <div className="hz-inline-actions">
      <button type="button" className="hz-btn hz-btn-secondary" onClick={() => router.push(target.href)}>Kayda Git</button>
      <button type="button" className="hz-btn hz-btn-secondary">Ustlen</button>
      <button type="button" className="hz-btn hz-btn-secondary">Tamamla</button>
      {task.approvalId ? <button type="button" className="hz-btn hz-btn-secondary" onClick={() => router.push(`/onaylar/${task.approvalId}`)}>Approval</button> : null}
    </div>
  );
}

export function TaskListTable({ tasks }: { tasks: Task[] }) {
  return (
    <div className="table-wrap hz-table-wrap">
      <table className="table hz-table hz-table-sticky">
        <thead><tr><th>Gorev Basligi</th><th>Ilgili Kayit</th><th>Musteri</th><th>Oncelik</th><th>Son Tarih</th><th>Kaynak</th><th>Durum</th><th>Aksiyon</th></tr></thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.title}</td><td>{task.entityNo}</td><td>{task.customerName ?? "-"}</td><td><span className={badgeClass(task.priority)}>{priorityLabels[task.priority]}</span></td><td>{new Date(task.dueAt).toLocaleString("tr-TR")}</td><td>{task.source === "ai" ? "Yapay Zeka" : "Sistem"}</td><td>{statusLabels[task.status]}</td><td><TaskQuickActions task={task} /></td>
            </tr>
          ))}
          {tasks.length === 0 ? <tr><td colSpan={8}><div className="table-empty">Bu kart icin gorev bulunmuyor.</div></td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}
