/**
 * Güvenli operasyon varlık detay rotaları (Hızlı İşlem, Onaylar, belge zinciri).
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
      return { href: `/teklifler/${id}`, label: "Teklif detayına git" };
    case "order":
      return { href: `/siparisler/${id}`, label: "Sipariş detayına git" };
    case "payment":
      return { href: `/tahsilatlar/${id}`, label: "Tahsilat detayına git" };
    case "document":
      return { href: `/belgeler/${id}`, label: "Belge detayına git" };
    case "delivery":
      return { href: `/teslimatlar/${id}`, label: "Teslimat detayına git" };
    case "return":
      return { href: `/iadeler/${id}`, label: "İade detayına git" };
    case "customer":
      return { href: `/cariler/${id}`, label: "Cari detayına git" };
    case "invoice":
      return { href: `/faturalar/${id}`, label: "Fatura detayına git" };
    case "warehouse_order":
      return { href: `/depo/emirler/${id}`, label: "Depo emri detayına git" };
    case "ai_proposal":
      return { href: "/ai/onaylar", label: "AI onay önerisine git" };
    default:
      return null;
  }
}

export function resolveApprovalInboxHref(approvalId: string): string {
  return `/onaylar/${approvalId}`;
}
