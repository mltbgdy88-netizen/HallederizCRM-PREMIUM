import type { PaymentReceipt } from "@hallederiz/types";

export function PaymentDocumentPanel({ payment }: { payment: PaymentReceipt }) {
  return (
    <section className="hz-content-card">
      <h3>Belge Paneli</h3>
      <ul className="hz-side-list hz-margin-top-sm">
        <li>Bagli belge sayisi: {payment.documentCount}</li>
        <li>Makbuz PDF: {payment.status === "draft" ? "Taslak" : "Olusturulabilir"}</li>
        <li>Musteri bildirimi: WhatsApp/PDF gonderim kaydi document deliveries ile tutulacak.</li>
        <li>Ters kayit: yetkili onayi ve audit gerektirir.</li>
      </ul>
    </section>
  );
}
