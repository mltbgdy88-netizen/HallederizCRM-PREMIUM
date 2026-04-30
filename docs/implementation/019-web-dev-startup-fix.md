# 019 - Web Dev Startup Fix

## Sorunun Nedeni
Web dev server'in `Starting...` asamasinda takilmasinin iki ana nedeni tespit edildi:

1. `pnpm --filter web dev -- -p 3010` komutunda gelen `--` argumani `next dev` surecine dogrudan aktarildigi icin Next bunu proje klasoru argumani gibi yorumluyor ve startup kararsizlasiyordu.
2. Windows ortaminda `distDir` olarak build ile dev'in ayni klasoru (`.runtime-next`) kullanmasi, ozellikle `trace` dosyalarinda kilit/cakisma olusturup dev startup'i yarim acik durumda birakabiliyordu.

## Yapilan Duzeltme

1. `apps/web/package.json`
- `dev` scripti `next dev` yerine `node scripts/dev.cjs` olarak guncellendi.
- `dev:clean` scripti eklendi (sadece web cache temizligi: `.runtime-next`, `.runtime-next-dev`, `tsconfig.tsbuildinfo`).

2. `apps/web/scripts/dev.cjs` (yeni)
- `pnpm` tarafindan gecilen `--` argumanini filtreleyip Next'i temiz argumanlarla baslatan wrapper eklendi.
- Bu sayede hem `pnpm --filter web dev -p 3010` hem de `pnpm --filter web dev -- -p 3010` guvenli calisir.

3. `apps/web/next.config.mjs`
- Dev ve build icin ayrik `distDir` kullanimi eklendi:
  - Dev: `.runtime-next-dev`
  - Build/production: `.runtime-next`
- Bu ayrim Windows dosya kilidi kaynakli startup takilmalarini engeller.

4. `.gitignore`
- `.runtime-next-dev` ignore listesine eklendi.

## Windows Uzerinde Calistirma Komutu

```powershell
pnpm --filter @hallederiz/web dev -- -p 3010
```

## Temiz Baslatma Komutu

```powershell
pnpm --filter @hallederiz/web dev:clean
pnpm --filter @hallederiz/web dev -- -p 3010
```

## Dogrulama Sonuclari

Startup dogrulamasi:
- Next logu: `Ready in 2s`
- `http://localhost:3010/login` -> `200`
- `http://localhost:3010/hizli-islem` -> `200`
- API health etkilenmedi: `http://localhost:4000/health` -> `200`

Kalite komutlari:
- `pnpm test` -> PASS
- `pnpm typecheck` -> PASS
- `pnpm build` -> PASS
- `pnpm smoke:routes` -> PASS
- `pnpm smoke:navigation` -> PASS

## Degisen Dosyalar
- `.gitignore`
- `apps/web/next.config.mjs`
- `apps/web/package.json`
- `apps/web/scripts/dev.cjs` (yeni)

## Not
- `.env.local` commitlenmedi.
