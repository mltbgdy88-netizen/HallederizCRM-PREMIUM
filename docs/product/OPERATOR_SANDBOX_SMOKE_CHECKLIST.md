# Operator sandbox smoke checklist (local / demo)

Bu liste, Approval Inbox (`/onaylar`) ve demo sandbox akisinin **manuel** dogrulanmasi icindir. Otomasyon: `pnpm test:web-approvals` (yardimci/test modulleri) ve `pnpm test` (API paketi).

## Onc kosullar

- API ve web dev sunuculari ayakta (`pnpm dev` veya proje standardi).
- Gecerli tenant oturumu (demo/local auth).
- `NEXT_PUBLIC_API_BASE_URL` API ile uyumlu.

## Adimlar

1. **Sayfa acilir** — `/onaylar` yuklenir; anonim ise oturum mesaji, authenticated ise liste alani.
2. **Redirect** — `/approvals` ve `/dashboard/approvals` adresleri `/onaylar`a yonlenmeli.
3. **Worker health** — Worker health karti 200/ok veya aciklayici uyari; sahte "basarili" uydurma yok.
4. **Operatör dogrulama paneli** — Development ortaminda "Operatör dogrulama (local/demo)" paneli gorunur; production derlemesinde yalnizca kisa bilgilendirme bandi (sandbox smoke gosterilmez).
5. **Sandbox seed** — "Demo onay kaydi olustur" ile seed cagirilir; sonuc mesaji okunur:
   - Yeni kayit: olusturulan sayi.
   - Idempotent: "yeni kayit yok ... hata degil" benzeri guvenli bilgi (kirmizi hata bandi degil).
6. **Liste** — Filtre "Bekleyen" veya "Tumu" ile pending satirlar gorunur; sahte satir uretilmez.
7. **Detay** — Ilk satir secili; execution / outbox / gate alanlari API'den geliyorsa dolu.
8. **Onayla** — Basarili yanitta toast; "Son islem sonucu (onay API)" bolumunde `executionId`, `outboxJobId`, bridge, `auditTimelineWritebackQueued`, `gateDecision` ozeti.
9. **Idempotent onay** — Ayni pending olmayan kayitta tekrar onay: sakin bilgi toast (zaten islenmis).
10. **Reddet** — Bos nedenle Reddet: client tarafinda uyari; API'ye bos gitmez.
11. **404 kontrolu** — Tarayici ag sekmesinde `/platform/approvals` ve worker path'leri icin beklenmeyen 404 olmamali.
12. **Guvenlik sinyalleri** — Worker/safety yanitinda `providerWritesEnabled: false`, `realExecutionEnabled: false` beklenir (foundation demo).

## Production beklentisi

- Sandbox araci ve demo seed **gosterilmez** / calismaz.
- Smoke checklist paneli production modunda sahte yesil sonuc gostermez.

## Ilgili kod

- Smoke sozlesmesi: `apps/web/src/features/approvals/utils/operator-smoke.ts`
- UI paneli: `apps/web/src/features/approvals/components/ApprovalOperatorSmokePanel.tsx`
