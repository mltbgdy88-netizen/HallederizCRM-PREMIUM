# 017 - Release Candidate Audit

## Denetim Tarihi
- 2026-04-30

## Denetim Kapsami
Bu denetim yeni feature eklemeden, mevcut release candidate'in pilot kabul oncesi teknik ve operasyonel hazirlik durumunu dogrulamak icin yapildi.

## Calistirilan Komutlar
- `git status --short`
- `git log --oneline -n 15`
- `pnpm test`
- `pnpm typecheck`
- `pnpm build`
- `pnpm run smoke:routes`
- `pnpm run smoke:navigation`

## Komut Sonuclari
- `git status --short`: temiz (staged/unstaged degisiklik yok)
- `git log --oneline -n 15`: beklenen yol haritasi commit zinciri mevcut
- `pnpm test`: basarili (103/103)
- `pnpm typecheck`: basarili
- `pnpm build`: basarili
- `pnpm run smoke:routes`: basarili
- `pnpm run smoke:navigation`: basarili

## Kritik Dosya Varlik Kontrolu
Asagidaki dosyalar mevcut ve okunabilir:
- `.github/workflows/quality-gate.yml`
- `docs/implementation/016-pilot-acceptance-checklist.md`
- `docs/qa/quick-operation-manual-test-plan.md`
- `docs/qa/whatsapp-workflow-manual-test-plan.md`
- `apps/web/app/(platform)/hizli-islem/page.tsx`
- `apps/api/src/quick-operations/routes.ts`
- `apps/api/src/modules/quick-operations/service.ts`
- `packages/types/src/quick-operations.ts`
- `packages/domain/src/quick-operations/index.ts`
- `apps/api/src/shared/auth-mode.ts`
- `apps/api/src/shared/persistence-policy.ts`
- `apps/api/src/shared/webhook-security.ts`
- `apps/api/src/modules/whatsapp-workflow/store.ts`
- `apps/api/src/modules/whatsapp-workflow/repository.ts`
- `apps/local-ai-service/README.md`

## Pilot-Ready Alanlar
- Quality gate ve CI tabani aktif.
- Auth hardening aktif: demo auth explicit flag ile sinirli, production davranisi fail-closed.
- API read guard hardening aktif: hassas read endpoint'ler auth/permission korumali.
- Postgres fallback hardening aktif: production/postgres modda sessiz mock fallback engellenmis.
- WhatsApp webhook security aktif: signature fail-open degil, production secret yoksa kabul yok.
- WhatsApp workflow temel katmanlari aktif:
  - idempotency
  - duplicate guard
  - command parser/approval foundation
  - persistence foundation
- Local AI service foundation monorepoda mevcut, API local provider degrade path testli.
- Hizli Islem Merkezi:
  - frontend route ve ekran foundation mevcut
  - backend contract + submit path mevcut
  - offer/sale_order/payment execution baglari testli
  - delivery/return controlled davranis + side actions testli

## Foundation Kalan Alanlar (Bilincli)
- Gercek WhatsApp outbound send bu turda acik degil (taslak/foundation odakli).
- Gercek PDF binary render tam bagli degil (preview/foundation akisi agirlikli).
- AI full autonomous execution acik degil (approval-first ve controlled pattern korunuyor).
- Quick Operation delivery/return tarafinda bazi senaryolar controlled foundation path'e dusme ihtimalini koruyor.
- Local AI production orchestration ve model ops olgunlastirma sonraki fazlarda.

## Production Blocker Listesi
Asagidakiler production go-live oncesi bloklayici olarak degerlendirildi:
1. Production secret/env tamamligi dogrulanmadan canliya cikis yapilamaz.
   - Ozellikle: `WHATSAPP_WEBHOOK_APP_SECRET`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN`, auth/provider secretlari.
2. Gercek document binary render ve operasyonel cikti SLA'si netlestirilmeden kritik belge akislarinda risk vardir.
3. WhatsApp outbound canli gonderim kapali/foundation oldugu icin canli operasyon bekleyen senaryolar sinirlidir.

## Pilot Blocker Listesi
Asagidaki maddeler pilot kapsaminda risk olusturur ancak kontrollu pilotla yonetilebilir:
1. Delivery/return bazi patikalarda foundation mode'a dusebilir; operasyon ekibi bu farki bilmeli.
2. AI tarafi local-first foundation oldugu icin operator beklentisi chat-bot degil onayli asistan olarak yonetilmeli.
3. Local AI servisinin ortam kurulumu (Ollama/STT/TTS) tamamlanmadan ilgili pilot use-case'ler devreye alinmamali.

## Hızlı İşlem Readiness Notlari
- `/hizli-islem` smoke route listesinde mevcut.
- `apps/api/src/tests/quick-operations.test.ts` icinde:
  - auth guard testleri
  - sale_order executed testi
  - factory impact testi
  - payment validation testi
  - delivery/return controlled davranis testleri
  - side action davranis testleri bulunuyor.

## WhatsApp Readiness Notlari
- Signature verification fail-open degil.
- Production missing secret testi mevcut.
- duplicate `messageId` idempotency testli.
- command parser/approval ve command audit testli.
- raw token saklanmama davranisi testli.
- Postgres persistence policy testleri mevcut.

## Auth / Persistence Readiness Notlari
- `DEMO_AUTH_ENABLED` production disinda explicit.
- `NEXT_PUBLIC_ENABLE_DEMO_AUTH` default kapali.
- `ALLOW_DEMO_FALLBACK=false` default, production notu dokumante.
- `PERSISTENCE_MODE=postgres` + DB zorunlulugu `.env.example` notlarinda acik.

## Local AI Readiness Notlari
- `apps/local-ai-service` yapisi mevcut.
- Buyuk model/binary artefakti repo icinde zorunlu tutulmuyor.
- README kurulum ve endpoint bilgisini veriyor.
- API local provider degrade davranisi testli.
- CI Python dependency yuklemeye bagli degil.

## Manual Test Baslamadan Once Yapilacaklar
1. Pilot tenant env degerlerini production policy'ye gore doldur.
2. WhatsApp webhook verify + signature testlerini staging'de tekrarla.
3. Quick Operation akislarini `docs/qa/quick-operation-manual-test-plan.md` ile adim adim gec.
4. WhatsApp command/duplicate senaryolarini `docs/qa/whatsapp-workflow-manual-test-plan.md` ile dogrula.
5. Local AI servisinin host bazli erisimi ve timeout degerlerini pilot altyapisinda teyit et.

## Onerilen Sonraki Adim
- Tam canli gecis oncesi "staging dry-run + operator acceptance" turu yapilarak:
  - document real render
  - outbound channels
  - high-volume webhook davranisi
  icin son kararlar verilmelidir.
