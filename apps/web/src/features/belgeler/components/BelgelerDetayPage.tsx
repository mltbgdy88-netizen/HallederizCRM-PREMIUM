"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useBelgelerReferenceData } from "@/features/belgeler/hooks/use-belgeler-reference-data";
import { useBelgelerDetayReferenceData } from "@/features/belgeler/hooks/use-belgeler-detay-reference-data";
import { REFERENCE_ROUTE_IDS } from "@/lib/reference/reference-route-ids";

export function BelgelerDetayPage() {
  const searchParams = useSearchParams();
  const rowId = (searchParams.get("documentId") ?? searchParams.get("id") ?? REFERENCE_ROUTE_IDS.documentId).trim() || REFERENCE_ROUTE_IDS.documentId;
  const { getContext } = useBelgelerReferenceData();
  const {
    data: { preview: BDM_PREVIEW, actions: BDM_ACTIONS }
  } = useBelgelerDetayReferenceData();
  const context = getContext(rowId);
  const fields = [
    { label: "Belge No", value: context.docNo },
    { label: "Belge Türü", value: context.type },
    { label: "Belge Tarihi", value: context.date },
    { label: "Cari", value: context.customer },
    { label: "Açıklama", value: context.description },
    { label: "Oluşturan", value: context.uploader }
  ];
  const extra = [
    { label: "Dosya Adı", value: context.fileName },
    { label: "Dosya Boyutu", value: context.fileSize },
    { label: "Durum", value: context.status },
    { label: "Yükleme Tarihi", value: context.date }
  ];

  return (
    <div className="bdm-home">
      <header className="bdm-head">
        <div className="bdm-head-copy">
          <Link href="/belgeler" className="bdm-back">
            ← Geri
          </Link>
          <h1>Belge Detay</h1>
          <p>Belge bilgilerini görüntüleyin ve işlemlerinizi gerçekleştirin.</p>
        </div>
        <span className="bdm-doc-badge">Belge No: {context.docNo}</span>
      </header>

      <div className="bdm-workspace">
        <section className="bdm-info-card" aria-label="Belge bilgileri">
          <h2>Belge Bilgileri</h2>
          <dl>
            {fields.map((field) => (
              <div key={field.label}>
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="bdm-preview-card" aria-label="Belge önizleme">
          <header className="bdm-viewer-bar">
            <button type="button" aria-label="Önceki sayfa">
              ↑
            </button>
            <button type="button" aria-label="Sonraki sayfa">
              ↓
            </button>
            <button type="button" aria-label="Yakınlaştır">
              +
            </button>
            <button type="button" aria-label="Uzaklaştır">
              −
            </button>
            <span>1/1</span>
            <button type="button" className="bdm-viewer-dl" aria-label="İndir">
              ↓
            </button>
          </header>
          <article className="bdm-invoice">
            <header>
              <h3>{BDM_PREVIEW.title}</h3>
              <p className="bdm-invoice-seller">{BDM_PREVIEW.seller}</p>
              <p className="bdm-invoice-buyer">{BDM_PREVIEW.buyer}</p>
            </header>
            <table>
              <thead>
                <tr>
                  <th>Ürün</th>
                  <th>Adet</th>
                  <th>Tutar</th>
                </tr>
              </thead>
              <tbody>
                {BDM_PREVIEW.lines.map((line) => (
                  <tr key={line.name}>
                    <td>{line.name}</td>
                    <td>{line.qty}</td>
                    <td>{line.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <footer>
              <strong>Toplam: {BDM_PREVIEW.total}</strong>
            </footer>
          </article>
        </section>

        <aside className="bdm-side" aria-label="İşlemler">
          <article className="bdm-actions-card">
            <h2>İşlemler</h2>
            <ul>
              {BDM_ACTIONS.map((action) => (
                <li key={action.id}>
                  <button type="button" className="bdm-action-btn">
                    {action.label}
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="bdm-delete-btn">
              Sil
            </button>
          </article>

          <article className="bdm-extra-card">
            <h2>Ek Bilgiler</h2>
            <dl>
              {extra.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </article>
        </aside>
      </div>
    </div>
  );
}
