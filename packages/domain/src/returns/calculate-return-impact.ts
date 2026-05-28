import type { Return, ReturnImpact } from "@hallederiz/types";

export function calculateReturnImpact(returnRecord: Return): ReturnImpact {
  const returnedQuantity = returnRecord.lines.reduce((total, line) => total + line.quantity, 0);
  const approvalRequired = returnedQuantity > 10 || returnRecord.lines.some((line) => line.reasonCategory === "quality");

  return {
    stockImpact: returnedQuantity,
    balanceImpact: 0,
    documentImpact: "Iade notu ve gerekirse cari ekstre belgesi uretilecek.",
    approvalRequired,
    messages: [
      `${returnedQuantity} adet stok geri giris etkisi olusur.`,
      "Bakiye etkisi fatura/iade faturasi baglantisi ile netlesir.",
      approvalRequired ? "Iade icin yetkili onayi onerilir." : "Standart iade akisi uygulanabilir."
    ]
  };
}
