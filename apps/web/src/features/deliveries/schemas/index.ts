export interface DeliveryFilters {
  customer: string;
  status: string;
  readyOnly: boolean;
  missingPaymentOnly: boolean;
  documentStatus: string;
  dateRange: string;
}
