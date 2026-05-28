# HallederizCRM-PREMIUM Master Implementation Roadmap

## 1. Ana Karar

Ana urun `HallederizCRM-PREMIUM` olarak devam edecektir.

Referans eski repo:
- `mltbgdy88-netizen/hallederizcrm-wa-clean`

Eski repo yeni projeye birebir tasinacak bir kod tabani degildir. Degerli urun, guvenlik, workflow, smoke test, WhatsApp ve lokal AI fikirleri referans olarak alinacak; yeni monorepo mimarisi icinde kucuk, denetlenebilir PR adimlariyla yeniden uygulanacaktir.

## 2. Uygulama Prensipleri

- Buyuk rewrite yapilmayacak.
- Her gelistirme kucuk PR adimlariyla yapilacak.
- Runtime davranisi degistiren isler once dokuman ve kontrat netligiyle baslayacak.
- Eski repodan alinacak parcalar once reuse map ile siniflandirilacak.
- Production path ve demo/fallback path ayrimi korunacak.
- Typecheck, lint, test ve smoke gate kirilmadan ilerlenilecek.

## 3. Sirali Isler

1. Reference docs and assets
2. CI / typecheck / lint / test gate
3. Auth hardening
4. API read/write guard hardening
5. Postgres dependency and no silent mock fallback in production
6. WhatsApp webhook security and workflow port
7. Local AI backend port
8. Quick Operation Center frontend foundation
9. Quick Operation backend contract
10. Warehouse/factory/supplier source planning
11. Payment/return modes
12. Documents/WhatsApp/AI integration
13. E2E pilot acceptance

Not: Gercek ESLint config ve lint rule migration ayri bir takip PR'i olarak ele alinacak; kalite kapisinin ilk turu typecheck, build, API testleri ve server gerektirmeyen smoke kontrollerine odaklanir.

## 4. Referans Dokuman Seti

Bu roadmap asagidaki dokumanlarla birlikte okunmalidir:

- `docs/implementation/001-wa-clean-reuse-map.md`
- `docs/product/quick-operation-center.md`
- `docs/ui/quick-operation-reference/README.md`
- `docs/master-project-spec.md`
- `docs/architecture.md`
- `docs/module-map.md`

## 5. Kapanis Kriteri

Bu roadmap'in ilk adimi tamamlandiginda:

- Eski repo reuse kararlari dokumante edilmis olur.
- Hızlı Islem Merkezi urun karari dokumante edilmis olur.
- UI referans gorselleri repo icinde izlenebilir olur.
- Runtime kod, API, SDK, domain ve package ayarlari degismemis olur.
