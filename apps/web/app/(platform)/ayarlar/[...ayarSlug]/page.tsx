import { renderProductCatchAll } from "../../../../src/navigation/render-product-catch-all";

type PageProps = {
  params: Promise<{ ayarSlug: string[] }>;
};

export default async function AyarlarDeepPage({ params }: PageProps) {
  const resolvedParams = await params;
  const rest = resolvedParams.ayarSlug ?? [];
  return renderProductCatchAll(["ayarlar", ...rest]);
}
