# Pilot Go-Live Checklist

Canliya gecis oncesi minimum kontrol listesi.

## Auth ve Tenant
- [ ] Login/session dogrulandi
- [ ] Tenant izolasyonu test edildi
- [ ] Kritik write endpointleri role/permission ile korunuyor

## Veri Hazirligi
- [ ] Sirket profili tamamlandi
- [ ] Fiyat slotlari ve kategori slotlari guncel
- [ ] Cari/Urun/Stok import kontrolleri tamam

## ERP
- [ ] Baglanti testi basarili
- [ ] Mapping kontrol edildi
- [ ] Son sync loglari temiz

## WhatsApp
- [ ] Business baglanti ve template kontrolu
- [ ] Action request -> approval akisi dogrulandi

## AI
- [ ] Read-only default acik
- [ ] Mutation approval zorunlu acik
- [ ] Proposal -> approval -> execution akisi test edildi

## Belge ve Local Output
- [ ] Belge render/regenerate dogrulandi
- [ ] Queue save / queue print jobs gorunuyor
- [ ] Local agent status saglikli

## Roller ve Kullanicilar
- [ ] Yonetici/Satis/Muhasebe/Depo/Pazarlama rollerine gore erisimler test edildi
- [ ] Pilot kullanicilarda mobil erisim/approval yetkileri kontrol edildi

## Operasyonel Akis
- [ ] Cari -> Teklif -> Siparis
- [ ] Siparis -> Tahsilat -> Depo -> Teslimat -> Fatura
- [ ] Belgeler ve timeline kayitlari dogrulandi

## Smoke
- [ ] `pnpm typecheck`
- [ ] `pnpm build`
- [ ] `pnpm run smoke:routes`
- [ ] `pnpm run smoke:navigation`
