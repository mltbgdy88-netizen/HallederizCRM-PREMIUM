import type { PaymentReceipt } from "@hallederiz/types";

export function PaymentDocumentPanel({ payment }: { payment: PaymentReceipt }) {
  return (
    <section className="hz-content-card">
      <h3>Belge paneli</h3>
      <ul className="hz-side-list hz-margin-top-sm">
        <li>Bağlı belge sayısı: {payment.documentCount}</li>
        <li>Makbuz PDF: {payment.status === "draft" ? "Taslak önizleme" : "Önizleme hazırlanabilir"}</li>
        <li>Müşteri bildirimi: WhatsApp/PDF gönderimi henüz canlı kullanıma bağlı değil.</li>
        <li>Ters kayıt: yetkili onayı ve denetim kaydı gerekir.</li>
      </ul>
    </section>
  );
}

