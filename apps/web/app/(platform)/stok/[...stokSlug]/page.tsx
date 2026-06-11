import { renderProductCatchAll } from "../../../../src/navigation/render-product-catch-all";

type PageProps = {
  params: Promise<{ stokSlug: string[] }>;
};

export default async function StokDeepPage({ params }: PageProps) {
  const resolvedParams = await params;
  const rest = resolvedParams.stokSlug ?? [];
  return renderProductCatchAll(["stok", ...rest]);
}
