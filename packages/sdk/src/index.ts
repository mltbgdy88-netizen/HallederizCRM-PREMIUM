import { ApiClient, type ApiClientOptions } from "./base";
import {
  ApprovalsClient,
  AiClient,
  PlatformClient,
  QuickOperationsClient,
  CustomersClient,
  DashboardClient,
  DeliveriesClient,
  DocumentsClient,
  ImportsClient,
  InvoicesClient,
  OffersClient,
  OrdersClient,
  PaymentsClient,
  ReturnsClient,
  StockClient,
  WarehouseClient,
  WhatsAppClient,
  OmnichannelClient
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
  documents: DocumentsClient;
  ai: AiClient;
  platform: PlatformClient;
  imports: ImportsClient;
  quickOperations: QuickOperationsClient;
  whatsapp: WhatsAppClient;
  omnichannel: OmnichannelClient;
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
    dashboard: new DashboardClient(apiClient),
    documents: new DocumentsClient(apiClient),
    ai: new AiClient(apiClient),
    platform: new PlatformClient(apiClient),
    imports: new ImportsClient(apiClient),
    quickOperations: new QuickOperationsClient(apiClient),
    whatsapp: new WhatsAppClient(apiClient),
    omnichannel: new OmnichannelClient(apiClient)
  };
}
