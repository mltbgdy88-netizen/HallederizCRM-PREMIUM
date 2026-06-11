import { ReturnCreatePage } from "../../../../src/features/returns/components/ReturnCreatePage";

export default async function IadelerYeniPage({ searchParams }: { searchParams?: Promise<{ order?: string }> }) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  return <ReturnCreatePage sourceOrderId={resolvedSearchParams?.order ?? null} />;
}
