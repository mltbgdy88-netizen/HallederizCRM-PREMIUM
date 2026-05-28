"use client";

import Link from "next/link";
import { dataSourceConfig } from "../../../lib/data-source";

export function OfflineApiStatePage() {
  return (
    <div className="hz-system-state-page">
      <article className="hz-system-state-card" role="alert">
        <h1>API bağlantısı kullanılamıyor</h1>
        <p>
          Sunucuya şu an ulaşılamıyor. Oturum ve veri işlemleri güvenli şekilde durduruldu; teknik hata detayı
          gösterilmez.
        </p>
        <div className="hz-system-state-actions">
          <button type="button" className="hz-btn hz-btn-primary" onClick={() => window.location.reload()}>
            Yeniden dene
          </button>
          <Link className="hz-btn hz-btn-secondary" href="/dashboard">
            Gösterge paneline dön
          </Link>
        </div>
      </article>
    </div>
  );
}

export function DemoModeStatePage() {
  const demoOn = dataSourceConfig.useDemoData;
  return (
    <div className="hz-system-state-page">
      <article className="hz-system-state-card">
        <h1>Önizleme modu</h1>
        <p>
          {demoOn
            ? "Önizleme verisi açık. Ekranlardaki örnek kayıtlar canlı ERP/CRM verisi değildir; işlem sonuçları gerçek sistemde yürütülmez."
            : "Önizleme modu kapalı. Canlı veri kaynağı kullanılıyor; yine de kritik işlemler onay zincirinden geçer."}
        </p>
        <div className="hz-system-state-actions">
          <Link className="hz-btn hz-btn-primary" href="/ayarlar">
            Ayarlara git
          </Link>
          <Link className="hz-btn hz-btn-secondary" href="/dashboard">
            Gösterge paneli
          </Link>
        </div>
      </article>
    </div>
  );
}

export function LiveEmptyStatePage() {
  return (
    <div className="hz-system-state-page">
      <article className="hz-system-state-card">
        <h1>Canlı veri boş</h1>
        <p>
          Bağlantı kuruldu ancak bu görünüm için kayıt bulunmuyor. Sahte kayıt veya örnek satır eklenmez; filtreleri
          değiştirin veya ilgili modülden yeni kayıt oluşturun.
        </p>
        <div className="hz-system-state-actions">
          <Link className="hz-btn hz-btn-primary" href="/cariler">
            Cariler
          </Link>
          <Link className="hz-btn hz-btn-secondary" href="/archive">
            Arşiv
          </Link>
        </div>
      </article>
    </div>
  );
}

