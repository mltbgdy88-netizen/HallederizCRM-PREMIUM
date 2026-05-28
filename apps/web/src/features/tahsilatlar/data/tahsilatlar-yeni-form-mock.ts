// @ts-nocheck
export type TahsilatDistributionRow = {
  id: string;
  docType: string;
  docNo: string;
  dueDate: string;
  currency: string;
  balance: string;
  amount: string;
};

export const THYF_TITLE = "Yeni Tahsilat";
export const THYF_AMOUNT_DEFAULT = "0,00";
export const THYF_DATE_DEFAULT = "25.05.2025";
export const THYF_CARI_PLACEHOLDER = "Cari seçiniz...";
export const THYF_DESC_PLACEHOLDER = "Tahsilat açıklamasını giriniz...";
export const THYF_DESC_COUNTER = "0/255";

export const THYF_DISTRIBUTION_ROWS: TahsilatDistributionRow[] = [
  {
    id: "1",
    docType: "Fatura",
    docNo: "FTR-2025-0001",
    dueDate: "25.05.2025",
    currency: "TRY",
    balance: "₺12.450,00",
    amount: "₺ 0,00"
  }
];

export const THYF_SUMMARY = {
  totalBalance: "₺12.450,00",
  collectionTotal: "₺0,00",
  remainingBalance: "₺12.450,00"
} as const;

