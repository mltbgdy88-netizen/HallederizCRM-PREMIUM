import { renderProductCatchAll } from "../../../../../src/navigation/render-product-catch-all";

type PageProps = {
  params: { conversationId: string };
};

export default function GelenKutuKonusmaPage({ params }: PageProps) {
  return renderProductCatchAll(["gelen-kutu", "konusma", params.conversationId]);
}
