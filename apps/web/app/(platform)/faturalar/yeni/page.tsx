import { InvoiceCreatePage } from "../../../../src/features/invoices/components/InvoiceCreatePage";

export default async function FaturalarYeniPage({ searchParams }: { searchParams?: Promise<{ order?: string }> }) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  return <InvoiceCreatePage sourceOrderId={resolvedSearchParams?.order ?? null} />;
}
