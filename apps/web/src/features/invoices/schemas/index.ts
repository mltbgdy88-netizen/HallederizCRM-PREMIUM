export interface InvoiceFilters {
  customer: string;
  status: string;
  dateRange: string;
  orderLinkedOnly: boolean;
  paymentStatus: string;
}
