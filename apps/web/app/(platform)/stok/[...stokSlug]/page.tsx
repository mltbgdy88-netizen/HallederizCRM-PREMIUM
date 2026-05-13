import { renderProductCatchAll } from "../../../../src/navigation/render-product-catch-all";

type PageProps = {
  params: { stokSlug: string[] };
};

export default function StokDeepPage({ params }: PageProps) {
  const rest = params.stokSlug ?? [];
  return renderProductCatchAll(["stok", ...rest]);
}
