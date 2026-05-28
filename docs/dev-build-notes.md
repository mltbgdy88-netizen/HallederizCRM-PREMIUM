# Dev Build Notes (Windows EPERM / trace lock)

## Sorun

Windows ortaminda bazen Next.js build cache dosyalari (`apps/web/.runtime-next/trace`, `.next`, `.next-cache`) kilitli kalabilir ve su hatayi uretir:

- `EPERM: operation not permitted, open ... trace`

## Kök Neden

- Ayni repo icinde daha once calismis `next dev`/`next build` sureclerinin dosya handle birakmasi
- Windows dosya kilidi + cache klasorlerinin kirli kalmasi

## Guvenli Cozum Adimi

1. Sadece bu repo yolunu kullanan `node/pnpm/turbo/next` sureclerini tespit et.
2. Sadece bu repo ile iliskili olanlari kapat.
3. Asagidaki cache alanlarini temizle:
   - `apps/web/.next`
   - `apps/web/.next-cache`
   - `apps/web/.runtime-next`
   - `apps/web/tsconfig.tsbuildinfo`
   - root `.turbo` ve `.turbo-cache2` (opsiyonel)
4. Sonra:
   - `pnpm typecheck`
   - `pnpm build`

## Not

Kod kaynakli bir hata degilse bu adimlar genelde sorunu cozer. Kilit tekrarlarsa IDE/terminalde acik kalan eski Next surecleri kontrol edilmelidir.


## 2026-04-29 EPERM trace notu
- Build sirasinda `apps/web/.runtime-next/trace` dosyasinda anlik `EPERM` kilidi gorulebilir.
- Bu durum kod hatasindan cok ortam kilidi/cached process etkisidir.
- Uygulanan guvenli adimlar:
  1. `apps/web/.runtime-next` ve `apps/web/.next` klasorlerini temizlemeyi dene.
  2. Hata devam ederse build komutunu yeniden calistir (anlik kilitler genellikle ikinci denemede duser).
  3. Yalniz bu repo ile ilgili acik `next dev/node` sureclerini kapatabildigin ortamlarda kapatip tekrar dene.
