import { renderProductCatchAll } from "../../../../src/navigation/render-product-catch-all";

type PageProps = {
  params: { ayarSlug: string[] };
};

export default function AyarlarDeepPage({ params }: PageProps) {
  const rest = params.ayarSlug ?? [];
  return renderProductCatchAll(["ayarlar", ...rest]);
}
