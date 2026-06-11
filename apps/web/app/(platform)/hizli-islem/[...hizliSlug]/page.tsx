import { renderProductCatchAll } from "../../../../src/navigation/render-product-catch-all";

type PageProps = {
  params: Promise<{ hizliSlug: string[] }>;
};

export default async function HizliIslemDeepPage({ params }: PageProps) {
  const resolvedParams = await params;
  const rest = resolvedParams.hizliSlug ?? [];
  return renderProductCatchAll(["hizli-islem", ...rest]);
}
