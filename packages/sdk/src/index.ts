import { ApiClient, type ApiClientOptions } from "./base";
import {
  ApprovalsClient,
  ArchiveClient,
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
  ErpClient,
  FactoryClient,
  OmnichannelClient,
  OperatorClient
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
  archive: ArchiveClient;
  documents: DocumentsClient;
  ai: AiClient;
  platform: PlatformClient;
  imports: ImportsClient;
  quickOperations: QuickOperationsClient;
  whatsapp: WhatsAppClient;
  erp: ErpClient;
  factory: FactoryClient;
  omnichannel: OmnichannelClient;
  operator: OperatorClient;
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
    archive: new ArchiveClient(apiClient),
    documents: new DocumentsClient(apiClient),
    ai: new AiClient(apiClient),
    platform: new PlatformClient(apiClient),
    imports: new ImportsClient(apiClient),
    quickOperations: new QuickOperationsClient(apiClient),
    whatsapp: new WhatsAppClient(apiClient),
    erp: new ErpClient(apiClient),
    factory: new FactoryClient(apiClient),
    omnichannel: new OmnichannelClient(apiClient),
    operator: new OperatorClient(apiClient)
  };
}
