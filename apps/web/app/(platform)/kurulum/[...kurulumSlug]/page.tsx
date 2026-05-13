import { renderProductCatchAll } from "../../../../src/navigation/render-product-catch-all";

type PageProps = {
  params: { kurulumSlug: string[] };
};

export default function KurulumDeepPage({ params }: PageProps) {
  const rest = params.kurulumSlug ?? [];
  return renderProductCatchAll(["kurulum", ...rest]);
}
