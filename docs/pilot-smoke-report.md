# Pilot Smoke Report

Tarih: 28 Nisan 2026

## 1) Test Edilen Route'lar

Asagidaki kritik route seti smoke foundation ile dogrulandi:

- `/`
- `/cariler`
- `/cariler/[customerId]`
- `/stok`
- `/teklifler`
- `/teklifler/yeni`
- `/teklifler/[offerId]`
- `/siparisler`
- `/siparisler/yeni`
- `/siparisler/[orderId]`
- `/tahsilatlar`
- `/tahsilatlar/yeni`
- `/tahsilatlar/[paymentId]`
- `/depo`
- `/depo/emirler/[warehouseOrderId]`
- `/teslimatlar`
- `/teslimatlar/[deliveryId]`
- `/faturalar`
- `/faturalar/[invoiceId]`
- `/iadeler`
- `/iadeler/yeni`
- `/iadeler/[returnId]`
- `/belgeler`
- `/whatsapp`
- `/erp`
- `/fabrikalar/stoklar`
- `/fabrikalar/siparisler`
- `/fabrikalar/siparisler/[factoryOrderId]`
- `/ai`
- `/ai/onaylar`
- `/ai/icgoruler`
- `/kullanicilar`
- `/kullanicilar/roller`
- `/ayarlar`

## 2) Test Edilen Ana Akislar

- Dashboard gorev karti -> gorev listesi -> ilgili kayit gecis zinciri (pattern kontrolu).
- Cari karti hizli aksiyonlari (teklif, siparis, tahsilat, WhatsApp).
- Tekliften siparise draft handoff.
- Siparisten tahsilat/depo/teslim/fatura gecisleri.
- WhatsApp baglam panelinden cari/siparis/tahsilat/belge gecisleri.
- Belge merkezinden ilgili entity navigasyonu.
- AI merkezinden onay ve icgoru ekranlarina gecis.

## 3) Bulunan ve Duzeltilen Eksikler

- `OrderDetailPage` icindeki kullanilmayan `PaymentCreateModal` kalintisi temizlendi.
- `smoke:e2e` scripti Windows'ta stabil calisacak sekilde guncellendi.
- `docs/demo-data-map.md` icine `return_1` kaydi eklendi (iade route smoke baglantisi icin).
- `apps/web/typecheck` scripti `next typegen` ile guclendirildi.

## 4) Bilincli Birakilan Acik Noktalar

- Bu turda Playwright tabanli tarayici otomasyonu degil, statik route/navigation smoke foundation eklendi.
- Mutation aksiyonlari halen foundation seviyesinde; smoke kontrolu navigasyon ve render patlamasi yakalamaya odakli.
- Approval execute, PDF render ve entegrasyon adapterlari gercek servis baglantisi olmadan mock flow olarak kalir.

## 5) Calistirilan Komutlar

- `pnpm run smoke:routes`
- `pnpm run smoke:navigation`
- `pnpm run smoke:e2e`
- `pnpm typecheck`
- `pnpm build`

Tum komutlar bu tur sonunda basarili calisti.
