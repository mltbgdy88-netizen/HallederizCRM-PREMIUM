"use client";

/**
 * Operatore webhook / prod guvenligi hatirlatmasi (salt bilgi).
 * Kaynak: docs/implementation/006-whatsapp-security-rules-port.md
 */
export function WhatsAppProductionSecurityChecklist() {
  return (
    <article className="hz-wa-side-card">
      <details className="hz-wa-prod-check-details">
        <summary className="hz-wa-prod-check-summary">Webhook: uretim kontrol listesi</summary>
        <ul className="hz-wa-prod-check-list">
          <li>Imza ham JSON govde uzerinden dogrulanir; parse edilmis body ile yeniden imzalanmaz.</li>
          <li>Desteklenen basliklar: <code className="hz-wa-prod-check-code">x-hub-signature-256</code>,{" "}
            <code className="hz-wa-prod-check-code">x-whatsapp-signature</code> (sha256= veya duz hex).</li>
          <li>App secret yoksa dogrulama hic true donmez; karsilastirma timing-safe.</li>
          <li>Production: secret yoksa inbound webhook 503; yanlis imza 403.</li>
          <li>GET dogrulama: <code className="hz-wa-prod-check-code">WHATSAPP_WEBHOOK_VERIFY_TOKEN</code> eslesmesi zorunlu.</li>
          <li>Yinelenen olaylar ve outbound: idempotency anahtari + duplicate guard (is akisi / outbox ile hizali).</li>
        </ul>
        <p className="hz-wa-ai-note">Bu liste canli yapilandirmayi degistirmez; API ve env kontrolleri icin referanstir.</p>
      </details>
    </article>
  );
}
