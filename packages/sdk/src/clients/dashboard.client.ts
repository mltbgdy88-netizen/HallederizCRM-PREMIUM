import type { DashboardCard, Task } from "@hallederiz/types";
import { ApiClient } from "../base";

export class DashboardClient {
  constructor(private readonly api: ApiClient) {}

  cards() {
    return this.api.get<{ items: DashboardCard[]; total: number }>("/dashboard/cards");
  }

  cardTasks(cardType: string) {
    return this.api.get<{ items: Task[] }>(`/dashboard/cards/${cardType}/tasks`);
  }

  summary() {
    return this.api.get<{ item: unknown }>("/dashboard/summary");
  }
}
