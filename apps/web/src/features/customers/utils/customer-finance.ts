import type { CustomerAccount } from "@hallederiz/types";

/** Gerçek hesap özeti yanıtı var mı (sahte sıfır üretilmez). */
export function isCustomerFinanceLinked(account: CustomerAccount | null | undefined): account is CustomerAccount {
  if (!account) {
    return false;
  }
  return (
    typeof account.balance === "number" ||
    typeof account.overdueAmount === "number" ||
    typeof account.creditLimit === "number"
  );
}
