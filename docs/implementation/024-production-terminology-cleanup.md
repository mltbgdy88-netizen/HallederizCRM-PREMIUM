# 024 - Production Terminology Cleanup

## Amac
Bu calisma, kullaniciya gorunen `pilot` ve `demo` dilini urunun gercek kullanim hedefiyle uyumlu hale getirmek icin yapildi. Teknik env ve kod contract isimleri korunurken, UI metinleri ve route sozlugu daha net production/local-dev terminolojisine cekildi.

## Yapilan Degisiklikler

1. Ayarlar route sozlugu guncellendi:
- Yeni canonical route: `/ayarlar/kullanim-hazirligi`
- Yeni canonical route: `/ayarlar/veri-yukleme`
- Legacy route redirectleri:
  - `/ayarlar/pilot-hazirlik` -> `/ayarlar/kullanim-hazirligi`
  - `/ayarlar/pilot-veri-yukleme` -> `/ayarlar/veri-yukleme`

2. Ayarlar ve hazirlik ekranlarinda metinler guncellendi:
- `Pilot Hazirlik Merkezi` -> `Kullanim Hazirligi Merkezi`
- `Pilot Veri Yukleme` -> `Veri Yukleme Merkezi`
- `Pilot Kurulum` -> `Kurulum Hazirligi`
- `Demo Gap` -> `Ornek Veri Boslugu`
- Staging durum etiketi `Demo / Fallback` -> `Yerel Gelistirme / Fallback`

3. Hızlı İşlem ve shell etkisi:
- `/hizli-islem` ekraninda kullaniciya gorunen `demo` etiketi bulunmamasi korundu.
- Platform shell breadcrumb/meta sozlugunde yeni ayarlar route adlari eklendi.

4. Local/dev teknik isimler korunarak aciklama dili netlestirildi:
- `LOCAL_PILOT_AUTH_*`, `DEMO_AUTH_ENABLED` gibi env isimleri degistirilmedi.
- `.env.example` notlari:
  - bu ayarlarin yerel gelistirme amacli oldugu
  - production auth yerine gecmedigi
  - gercek kullanici auth'un DB-backed yol ile calistigi
  sekilde guncellendi.

5. Seed default tenant adi:
- `Hallederiz Demo Tenant` -> `Hallederiz Operations Tenant`

## Degisen Dosyalar
- `apps/web/app/(platform)/ayarlar/pilot-hazirlik/page.tsx`
- `apps/web/app/(platform)/ayarlar/pilot-veri-yukleme/page.tsx`
- `apps/web/app/(platform)/ayarlar/kullanim-hazirligi/page.tsx`
- `apps/web/app/(platform)/ayarlar/veri-yukleme/page.tsx`
- `apps/web/src/components/platform-shell.tsx`
- `apps/web/src/features/settings/components/SettingsPage.tsx`
- `apps/web/src/features/settings/components/PilotReadinessPage.tsx`
- `apps/web/src/features/settings/components/StagingValidationPage.tsx`
- `apps/web/src/features/settings/queries/index.ts`
- `apps/web/src/features/imports/components/DataImportPage.tsx`
- `apps/web/src/features/documents/components/DocumentDetailPage.tsx`
- `apps/api/src/scripts/seed-admin-user.ts`
- `.env.example`
- `scripts/smoke/routes.cjs`
- `docs/module-map.md`
- `docs/gap-notes.md`

## Guvenlik ve Davranis Notu
- Auth policy degismedi.
- API contract degismedi.
- DB schema/migration degismedi.
- Quick Operation, WhatsApp, PDF, AI business logic degismedi.
- Env degisken adlari kirilmadi.

## Dogrulama
- `pnpm test`
- `pnpm typecheck`
- `pnpm build`
- `pnpm smoke:routes`
- `pnpm smoke:navigation`
