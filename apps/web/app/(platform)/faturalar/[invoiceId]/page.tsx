import { InvoiceDetailPage } from "../../../../src/features/invoices/components";

export default async function InvoiceDetailRoute({ params }: { params: Promise<{ invoiceId: string }> }) {
  const resolvedParams = await params;
  return <InvoiceDetailPage invoiceId={resolvedParams.invoiceId} />;
}
