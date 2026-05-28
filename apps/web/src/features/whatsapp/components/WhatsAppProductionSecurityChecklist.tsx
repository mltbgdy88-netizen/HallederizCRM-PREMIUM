"use client";

/** Kanal güvenliği — kullanıcıya yönelik özet (teknik yapılandırma detayı yok). */
export function WhatsAppProductionSecurityChecklist() {
  return (
    <article className="hz-wa-side-card">
      <h3 className="hz-wa-side-card-title">Kanal güvenliği</h3>
      <ul className="hz-wa-rule-list">
        <li>
          <span>Otomatik yanıt</span>
          <strong>Bağlantı gerekli</strong>
        </li>
        <li>
          <span>AI</span>
          <strong>Yalnızca öneri</strong>
        </li>
        <li>
          <span>Gönderim</span>
          <strong>Onay sonrası</strong>
        </li>
      </ul>
      <p className="hz-wa-ai-note">WhatsApp bağlantısı tamamlanmadan otomatik yanıt çalışmaz.</p>
    </article>
  );
}

