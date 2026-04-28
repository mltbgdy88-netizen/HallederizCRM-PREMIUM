import type { FactoryOrder } from "@hallederiz/types";
import type { RequestContext } from "../../../shared/request-context";
import {
  createFactoryOrder,
  getFactoryIntegrationHealth,
  getFactoryOrder,
  listFactories,
  listFactoryOrders,
  listFactoryStocks,
  syncFactoryStock,
  updateFactoryOrderStatus
} from "../../../integrations/mock-store";

export class FactoryAdapter {
  constructor(private readonly context: RequestContext) {}

  listFactories() {
    return listFactories().filter((item) => item.tenantId === this.context.tenantId);
  }

  listStocks(factoryId: string) {
    return listFactoryStocks(factoryId).filter((item) => item.tenantId === this.context.tenantId);
  }

  syncStock(factoryId: string) {
    return syncFactoryStock(factoryId);
  }

  listOrders() {
    return listFactoryOrders().filter((item) => item.tenantId === this.context.tenantId);
  }

  getOrder(id: string) {
    const order = getFactoryOrder(id);
    return order?.tenantId === this.context.tenantId ? order : null;
  }

  createOrder(payload: Partial<FactoryOrder>) {
    return createFactoryOrder(payload);
  }

  sendOrder(id: string) {
    return updateFactoryOrderStatus(id, "sent");
  }

  confirmOrder(id: string) {
    return updateFactoryOrderStatus(id, "confirmed");
  }

  markShipped(id: string) {
    return updateFactoryOrderStatus(id, "shipped");
  }

  completeOrder(id: string) {
    return updateFactoryOrderStatus(id, "completed");
  }

  getHealth() {
    return getFactoryIntegrationHealth();
  }
}
