import { renderProductCatchAll } from "../../../src/navigation/render-product-catch-all";

type PageProps = {
  params: { productSlug: string[] };
};

export default function ProductCatchAllPage({ params }: PageProps) {
  return renderProductCatchAll(params.productSlug ?? []);
}
