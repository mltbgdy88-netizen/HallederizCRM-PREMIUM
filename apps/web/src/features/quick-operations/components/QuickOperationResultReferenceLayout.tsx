"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useToast } from "../../../providers/toast-provider";
import { QUICK_OPERATION_SALES_DESK_HREF } from "../data/quick-operation-hub-data";
import { parseQuickOperationResultFromSearchParams } from "../utils/quick-operation-result-context";

export function QuickOperationResultReferenceLayout() {
  const searchParams = useSearchParams();
  const { pushToast } = useToast();

  const snapshot = useMemo(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return parseQuickOperationResultFromSearchParams(params);
  }, [searchParams]);

  return (
    <section className="qop-result-page" data-page="hizli-islem-sonuc-reference">
      <div className="qop-result-shell">
        <header className="qop-result-header">
          <div className="qop-result-header__main">
            <p className="qop-result-header__eyebrow">Hızlı İşlem</p>
            <h1 className="qop-result-header__title">Hızlı İşlem Sonuç Merkezi</h1>
            <p className="qop-result-header__meta">
              Son işlem özeti, bağlı kayıtlar ve sonraki adımlar. Canlı execution sonucu uydurulmaz.
            </p>
          </div>
          <Link href={QUICK_OPERATION_SALES_DESK_HREF} className="qop-result-header__back">
            Masaya dön
          </Link>
        </header>

        <p className="qop-result-demo-band" role="status">
          Önizleme modu: işlem sonucu yalnızca URL bağlamı veya boş durum gösterir; gerçek mutation yapılmaz.
        </p>

        {!snapshot ? (
          <div className="qop-result-empty" role="status">
            <h2 className="qop-result-empty__title">Son işlem sonucu bulunamadı</h2>
            <p className="qop-result-empty__text">
              Son işlem sonucu bulunamadı. Yeni işlem başlatmak için Hızlı İşlem Masasına dönebilirsiniz.
            </p>
            <Link href={QUICK_OPERATION_SALES_DESK_HREF} className="qop-result-btn qop-result-btn--primary">
              Hızlı İşlem Masasına dön
            </Link>
          </div>
        ) : (
          <main className="qop-result-layout">
            <section className="qop-result-main">
              <section className="qop-result-kpi-strip" aria-label="İşlem özeti">
                <div className="qop-result-kpi">
                  <span className="qop-result-kpi__label">İşlem no</span>
                  <span className="qop-result-kpi__value">{snapshot.referenceNo}</span>
                </div>
                <div className="qop-result-kpi">
                  <span className="qop-result-kpi__label">Tür</span>
                  <span className="qop-result-kpi__value">{snapshot.operationLabel}</span>
                </div>
                <div className="qop-result-kpi">
                  <span className="qop-result-kpi__label">Tarih</span>
                  <span className="qop-result-kpi__value">{snapshot.dateDisplay}</span>
                </div>
                <div className="qop-result-kpi qop-result-kpi--accent">
                  <span className="qop-result-kpi__label">Toplam</span>
                  <span className="qop-result-kpi__value">{snapshot.totalDisplay}</span>
                </div>
              </section>

              <section className="qop-result-card" aria-label="İşlem detayı">
                <header className="qop-result-card__head">
                  <h2>İşlem sonucu özeti</h2>
                  <span className="qop-result-badge qop-result-badge--info">{snapshot.statusLabel}</span>
                </header>
                <dl className="qop-result-field-grid">
                  <div className="qop-result-field">
                    <dt>Cari</dt>
                    <dd>{snapshot.customerName}</dd>
                  </div>
                  <div className="qop-result-field">
                    <dt>İşlem türü</dt>
                    <dd>{snapshot.operationLabel}</dd>
                  </div>
                  <div className="qop-result-field">
                    <dt>Tahsilat etkisi</dt>
                    <dd>{snapshot.paymentEffect ?? "Bağlı tahsilat kaydı yok veya henüz önizlenmedi."}</dd>
                  </div>
                  <div className="qop-result-field">
                    <dt>Teslim etkisi</dt>
                    <dd>{snapshot.deliveryEffect ?? "Teslimat hazırlık etkisi sonraki fazda bağlanacak."}</dd>
                  </div>
                  <div className="qop-result-field qop-result-field--full">
                    <dt>İade etkisi</dt>
                    <dd>{snapshot.returnEffect ?? "İade etkisi bu işlem türü için geçerli değil."}</dd>
                  </div>
                </dl>
              </section>

              <section className="qop-result-card" aria-label="Belge ve çıktılar">
                <header className="qop-result-card__head">
                  <h2>Belge / çıktı bağlantıları</h2>
                </header>
                <ul className="qop-result-link-list">
                  {snapshot.documentLinks.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="qop-result-link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="qop-result-btn qop-result-btn--ghost"
                  onClick={() => pushToast("PDF/Excel çıktısı sonraki entegrasyon fazında bağlanacaktır.")}
                >
                  PDF önizleme (toast)
                </button>
              </section>
            </section>

            <aside className="qop-result-side">
              <section className="qop-result-side-card" aria-label="Sonraki aksiyonlar">
                <header className="qop-result-side-card__head">
                  <h3>Sonraki aksiyonlar</h3>
                </header>
                <div className="qop-result-actions">
                  <Link href={QUICK_OPERATION_SALES_DESK_HREF} className="qop-result-btn qop-result-btn--primary">
                    Hızlı İşlem Masasına dön
                  </Link>
                  <Link href="/siparisler" className="qop-result-btn qop-result-btn--secondary">
                    Siparişlere git
                  </Link>
                  <Link href="/tahsilatlar" className="qop-result-btn qop-result-btn--secondary">
                    Tahsilatlara git
                  </Link>
                  <Link href="/belgeler" className="qop-result-btn qop-result-btn--secondary">
                    Belgelere git
                  </Link>
                </div>
              </section>
            </aside>
          </main>
        )}
      </div>
    </section>
  );
}
