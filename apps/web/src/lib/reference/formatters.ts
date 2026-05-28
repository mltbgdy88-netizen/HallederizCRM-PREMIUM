export function formatTryMoney(amount: number, currency = "TRY"): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatCount(value: number): string {
  return value.toLocaleString("tr-TR");
}

export function formatTrDate(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("tr-TR");
}

export function formatTrDateTime(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("tr-TR");
}

export function formatRelativeTimeAgo(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = Date.now() - d.getTime();
  if (diffMs < 0) return "—";
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "az önce";
  if (diffMin < 60) return `${diffMin} dk önce`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} saat önce`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} gün önce`;
}

export function buildTableMeta(total: number, pageSize = 10): {
  tableTotal: string;
  pageNumbers: readonly string[];
} {
  const pages = total > 0 ? Math.ceil(total / pageSize) : 1;
  const pageNumbers =
    pages <= 1
      ? (["1"] as const)
      : pages <= 3
        ? (Array.from({ length: pages }, (_, i) => String(i + 1)) as readonly string[])
        : (["1", "2", "3", "…", String(pages)] as const);

  return {
    tableTotal: `Toplam ${formatCount(total)} kayıt`,
    pageNumbers
  };
}

