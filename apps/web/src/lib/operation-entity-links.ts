// @ts-nocheck
/**
 * GÃ¼venli operasyon varlÄ±k detay rotalarÄ± (HÄ±zlÄ± Ä°ÅŸlem, Onaylar, belge zinciri).
 */
export function resolveOperationEntityHref(
  entityType: string,
  entityId: string
): { href: string; label: string } | null {
  const id = entityId?.trim();
  if (!id) {
    return null;
  }

  switch (entityType) {
    case "offer":
      return { href: `/teklifler/${id}`, label: "Teklif detayÄ±na git" };
    case "order":
      return { href: `/siparisler/${id}`, label: "SipariÅŸ detayÄ±na git" };
    case "payment":
      return { href: `/tahsilatlar/${id}`, label: "Tahsilat detayÄ±na git" };
    case "document":
      return { href: `/belgeler/${id}`, label: "Belge detayÄ±na git" };
    case "delivery":
      return { href: `/teslimatlar/${id}`, label: "Teslimat detayÄ±na git" };
    case "return":
      return { href: `/iadeler/${id}`, label: "Ä°ade detayÄ±na git" };
    case "customer":
      return { href: `/cariler/${id}`, label: "Cari detayÄ±na git" };
    case "invoice":
      return { href: `/faturalar/${id}`, label: "Fatura detayÄ±na git" };
    case "warehouse_order":
      return { href: `/depo/emirler/${id}`, label: "Depo emri detayÄ±na git" };
    case "factory_order":
      return {
        href: `/fabrikalar/siparis/detay?factoryOrderId=${encodeURIComponent(id)}`,
        label: "Fabrika sipariÅŸ detayÄ±na git"
      };
    case "ai_proposal":
      return { href: "/ai/onaylar", label: "AI onay Ã¶nerisine git" };
    default:
      return null;
  }
}

export function resolveApprovalInboxHref(approvalId: string): string {
  return `/onaylar/${approvalId}`;
}

