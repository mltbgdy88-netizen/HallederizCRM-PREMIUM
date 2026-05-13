# Production route manifest

Bu doküman, HallederizCRM Premium web uygulamasındaki **üretim bilgi mimarisi rotalarını** `apps/web/src/navigation/product-route-manifest.ts` ile eşler. Amaç: demo verisi üretmeden, eksik backend için **modül API bağlantısı bekliyor** dilinde shell ve navigasyon sağlamak.

## Durum etiketleri

| Durum | Anlamı |
| --- | --- |
| `implemented` | Mevcut ekran veya güvenli alias (redirect) ile bağlı |
| `shell` | Production modül iskeleti; başlık ve yönlendirme hazır |
| `needs-api` | Veri modeli veya modül API uçları tamamlanacak |
| `planned` | Yol haritasında; henüz shell üretilmedi |

## Sorumluluk

- **Cursor / Codex / both**: manifestte `ownerAgent` alanında tutulur; ekip içi dağılım için referanstır.

## Ana modül kökleri

`/panel`, `/gelen-kutu`, `/yardimci`, `/cariler`, `/teklifler`, `/siparisler`, `/hizli-islem`, `/tahsilatlar`, `/faturalar`, `/iadeler`, `/urunler`, `/stok`, `/depo-hazirlik`, `/teslimatlar`, `/belgeler`, `/onaylar`, `/gorevler`, `/is-akislari`, `/entegrasyonlar`, `/raporlar`, `/uyumluluk`, `/kurulum`, `/ayarlar`

Her biri için **landing** görünümü: alt rota kartları, durum rozeti, mevcut uygulanan ekranlara CTA.

## Dinamik rotalar

Kayıt kimliği içeren sekmeler (`/[customerId]/ozet` vb.) manifestte tek tek `href` olarak listelenmez; ilgili modül altında **catch-all** veya mevcut `[id]` sayfaları ile çözülür. Üçüncü segment ve sonrası için `render-product-catch-all` üretim shell üretir.

## Korunan aliaslar

- `/approvals` → `/onaylar`
- `/dashboard/approvals` → `/onaylar`
- `/whatsapp` → mevcut ekran (ürün ağacında `/gelen-kutu/whatsapp` ile paralel)

## Faz planı

1. Manifest ve shell (bu PR): navigasyon + landing + API bekleniyor dili.
2. Modül API: tenant kapsamlı uçlar ve yetki modeli.
3. Detay sekmeleri: kayıt başına sekmelerin gerçek veriyle doldurulması.

## İlgili kod

- `apps/web/src/navigation/product-route-manifest.ts`
- `apps/web/src/navigation/render-product-catch-all.tsx`
- `apps/web/src/components/product-page-shell.tsx`
- `apps/web/src/components/product-module-landing.tsx`
- `apps/web/app/(platform)/[...productSlug]/page.tsx`
