import { InvoiceCreatePage } from "../../../../src/features/invoices/components/InvoiceCreatePage";

export default function FaturalarYeniPage({ searchParams }: { searchParams?: { order?: string } }) {
  return <InvoiceCreatePage sourceOrderId={searchParams?.order ?? null} />;
}
