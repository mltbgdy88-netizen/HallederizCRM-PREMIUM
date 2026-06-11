import { ReturnCreatePage } from "../../../../src/features/returns/components/ReturnCreatePage";

export default function IadelerYeniPage({ searchParams }: { searchParams?: { order?: string } }) {
  return <ReturnCreatePage sourceOrderId={searchParams?.order ?? null} />;
}
