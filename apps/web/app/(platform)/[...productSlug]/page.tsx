import { renderProductCatchAll } from "../../../src/navigation/render-product-catch-all";

type PageProps = {
  params: Promise<{ productSlug: string[] }>;
};

export default async function ProductCatchAllPage({ params }: PageProps) {
  const resolvedParams = await params;
  return renderProductCatchAll(resolvedParams.productSlug ?? []);
}
