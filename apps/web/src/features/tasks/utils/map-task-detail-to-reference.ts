import type { Task } from "@hallederiz/types";

const priorityLabels: Record<Task["priority"], string> = {
  low: "Düşük",
  normal: "Normal",
  high: "Yüksek",
  critical: "Kritik"
};

const statusLabels: Record<Task["status"], string> = {
  open: "Açık",
  in_progress: "Devam",
  done: "Tamam",
  cancelled: "İptal",
  overdue: "Gecikti"
};

const entityLabels: Partial<Record<Task["entityType"], string>> = {
  order: "Sipariş",
  delivery: "Teslimat",
  customer: "Cari",
  product: "Ürün",
  payment: "Tahsilat",
  offer: "Teklif",
  invoice: "Fatura",
  return: "İade",
  document: "Belge"
};

export function formatTaskDate(value?: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("tr-TR");
}

export function buildTaskHeaderMeta(task: Task): string {
  return `${task.taskNo} · ${task.title} · ${statusLabels[task.status]} · ${formatTaskDate(task.dueAt)}`;
}

export function buildTaskReferenceKpis(task: Task) {
  const checklistDone = task.status === "done" ? 1 : task.status === "in_progress" ? 0.5 : 0;
  return [
    { id: "status", label: "Durum", value: statusLabels[task.status] },
    { id: "priority", label: "Öncelik", value: priorityLabels[task.priority], tone: task.priority === "critical" ? ("warning" as const) : undefined },
    { id: "due", label: "Son tarih", value: formatTaskDate(task.dueAt) },
    { id: "assignee", label: "Atanan", value: task.assigneeName ?? "—" },
    {
      id: "entity",
      label: "İlişkili kayıt",
      value: `${entityLabels[task.entityType] ?? task.entityType} ${task.entityNo}`
    },
    {
      id: "checklist",
      label: "Kontrol listesi",
      value: checklistDone >= 1 ? "Tamamlandı" : checklistDone > 0 ? "Devam ediyor" : "Bekliyor"
    }
  ];
}

export function buildTaskInfoFields(task: Task) {
  return [
    { label: "Başlık", value: task.title, full: true },
    { label: "Durum", value: statusLabels[task.status] },
    { label: "Öncelik", value: priorityLabels[task.priority] },
    { label: "Atanan kişi", value: task.assigneeName ?? "—" },
    { label: "Son tarih", value: formatTaskDate(task.dueAt) },
    { label: "Oluşturma", value: formatTaskDate(task.createdAt) },
    { label: "Müşteri", value: task.customerName ?? "—" },
    {
      label: "İlişkili kayıt",
      value: `${entityLabels[task.entityType] ?? task.entityType} · ${task.entityNo}`,
      full: true
    },
    { label: "Açıklama", value: task.description?.trim() || "—", full: true }
  ];
}

export function resolveTaskEntityHref(task: Task): string | null {
  if (task.entityType === "order") return `/siparisler/${task.entityId}`;
  if (task.entityType === "offer") return `/teklifler/${task.entityId}`;
  if (task.entityType === "payment") return `/tahsilatlar/${task.entityId}`;
  if (task.entityType === "delivery") return `/teslimatlar/${task.entityId}`;
  if (task.entityType === "invoice") return `/faturalar/${task.entityId}`;
  if (task.entityType === "return") return `/iadeler/${task.entityId}`;
  if (task.entityType === "document") return `/belgeler/${task.entityId}`;
  if (task.entityType === "customer" && task.customerId) return `/cariler/${task.customerId}`;
  return null;
}

export const TASK_CHECKLIST_DEMO = [
  { id: "c1", label: "İlgili kayıt doğrulandı", done: false },
  { id: "c2", label: "Müşteri bilgilendirildi", done: false },
  { id: "c3", label: "Operasyon notu eklendi", done: false }
];
