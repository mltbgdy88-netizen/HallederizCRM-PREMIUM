import { InvoiceDetailPage } from "../../../../src/features/invoices/components";

export default function InvoiceDetailRoute({ params }: { params: { invoiceId: string } }) {
  return <InvoiceDetailPage invoiceId={params.invoiceId} />;
}
