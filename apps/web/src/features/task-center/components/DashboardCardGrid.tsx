import type { DashboardCard } from "@hallederiz/types";
import { TaskMetricCard } from "./TaskMetricCard";

export function DashboardCardGrid({ cards, onOpenCard }: { cards: DashboardCard[]; onOpenCard: (card: DashboardCard) => void }) {
  return (
    <section className="hz-task-card-grid">
      {cards.map((card) => (
        <TaskMetricCard key={card.id} card={card} onOpen={onOpenCard} />
      ))}
    </section>
  );
}
