import { ApiClient, type ApiClientOptions } from "./base";
import {
  ApprovalsClient,
  CustomersClient,
  DashboardClient,
  DeliveriesClient,
  InvoicesClient,
  OffersClient,
  OrdersClient,
  PaymentsClient,
  ReturnsClient,
  StockClient,
  WarehouseClient
} from "./clients";

export * from "./base";
export * from "./clients";

export interface HallederizSdk {
  customers: CustomersClient;
  stock: StockClient;
  offers: OffersClient;
  orders: OrdersClient;
  payments: PaymentsClient;
  warehouse: WarehouseClient;
  deliveries: DeliveriesClient;
  invoices: InvoicesClient;
  returns: ReturnsClient;
  approvals: ApprovalsClient;
  dashboard: DashboardClient;
}

export function createHallederizSdk(options: ApiClientOptions): HallederizSdk {
  const apiClient = new ApiClient(options);

  return {
    customers: new CustomersClient(apiClient),
    stock: new StockClient(apiClient),
    offers: new OffersClient(apiClient),
    orders: new OrdersClient(apiClient),
    payments: new PaymentsClient(apiClient),
    warehouse: new WarehouseClient(apiClient),
    deliveries: new DeliveriesClient(apiClient),
    invoices: new InvoicesClient(apiClient),
    returns: new ReturnsClient(apiClient),
    approvals: new ApprovalsClient(apiClient),
    dashboard: new DashboardClient(apiClient)
  };
}
