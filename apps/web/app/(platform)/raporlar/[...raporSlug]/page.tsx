import { renderProductCatchAll } from "../../../../src/navigation/render-product-catch-all";

type PageProps = {
  params: { raporSlug: string[] };
};

export default function RaporlarDeepPage({ params }: PageProps) {
  const rest = params.raporSlug ?? [];
  return renderProductCatchAll(["raporlar", ...rest]);
}
