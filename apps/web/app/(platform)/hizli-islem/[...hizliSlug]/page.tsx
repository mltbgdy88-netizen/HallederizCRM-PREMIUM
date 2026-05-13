import { renderProductCatchAll } from "../../../../src/navigation/render-product-catch-all";

type PageProps = {
  params: { hizliSlug: string[] };
};

export default function HizliIslemDeepPage({ params }: PageProps) {
  const rest = params.hizliSlug ?? [];
  return renderProductCatchAll(["hizli-islem", ...rest]);
}
