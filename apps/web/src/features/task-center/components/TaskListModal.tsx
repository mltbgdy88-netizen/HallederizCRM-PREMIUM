import type { DashboardCard, Task } from "@hallederiz/types";
import { TaskListTable } from "./TaskListTable";

export function TaskListModal({ card, tasks, onClose }: { card: DashboardCard; tasks: Task[]; onClose: () => void }) {
  return (
    <div className="hz-modal-overlay" onClick={onClose} role="presentation">
      <section className="hz-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <header className="hz-modal-header">
          <div><p className="drawer-eyebrow">Gorev Listesi</p><h3>{card.title}</h3><p className="muted">Karttan acilan operasyonel is listesi; her satir ilgili kayda baglidir.</p></div>
          <div className="hz-modal-actions"><button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={onClose}>Kapat</button></div>
        </header>
        <div className="hz-modal-content hz-tab-content"><TaskListTable tasks={tasks} /></div>
      </section>
    </div>
  );
}
