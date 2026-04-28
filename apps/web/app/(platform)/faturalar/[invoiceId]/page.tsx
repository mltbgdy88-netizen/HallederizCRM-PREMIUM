import { InvoiceDetailPage as InvoiceDetailFeaturePage } from "../../../../src/features/invoices/components";

export default function InvoiceDetailPage({ params }: { params: { invoiceId: string } }) {
  return <InvoiceDetailFeaturePage invoiceId={params.invoiceId} />;
}
