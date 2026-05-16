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
4. **Operatör doğrulama** — Development ortamında sağ panelde özet doğrulama metni ve smoke durumu görünür; ayrıca üst mini kartlarda worker/outbox/yenileme bilgisi yer alır. Production derlemesinde sandbox smoke listesi gösterilmez.
5. **Sandbox seed** — Üst mini kart veya sağ paneldeki "Sandbox seed" / "Demo onay kaydı oluştur" ile seed çağrılır; sonuç mesajı okunur:
   - Yeni kayit: olusturulan sayi.
   - Idempotent: "yeni kayit yok ... hata degil" benzeri guvenli bilgi (kirmizi hata bandi degil).
6. **Liste** — Sekmeler (Bekleyen / Onaylanan / Reddedilen / Tümü) ve kart ızgarası; sahte satır üretilmez. İstemci tarafı ek filtreler yalnızca mevcut liste üzerinde daraltır.
7. **Detay** — İlk uygun kart seçili; **Seçili onay detayı** bölümünde execution / outbox / gate alanları API'den geliyorsa dolu.
8. **Kart veya detaydan Onayla** — Başarılı yanıtta toast; "Son işlem sonucu (onay API)" bölümünde `executionId`, `outboxJobId`, bridge, `auditTimelineWritebackQueued`, `gateDecision` özeti.
9. **Idempotent onay** — Aynı pending olmayan kayıtta tekrar onay: sakin bilgi toast (zaten işlenmiş).
10. **Reddet** — Boş nedenle Reddet: client tarafında uyarı; API'ye boş gitmez.
11. **404 kontrolü** — Tarayıcı ağ sekmesinde `/platform/approvals` ve worker path'leri için beklenmeyen 404 olmamalı.
12. **Güvenlik sinyalleri** — Worker/safety yanıtında `providerWritesEnabled: false`, `realExecutionEnabled: false` beklenir (foundation demo).

## Production beklentisi

- Sandbox araci ve demo seed **gosterilmez** / calismaz.
- Smoke checklist paneli production modunda sahte yesil sonuc gostermez.

## Ilgili kod

- Smoke sozlesmesi: `apps/web/src/features/approvals/utils/operator-smoke.ts`
- Operatör paneli (dogrulama ozeti): `apps/web/src/features/approvals/components/ApprovalOperatorSidePanel.tsx`
- Legacy smoke listesi (opsiyonel): `apps/web/src/features/approvals/components/ApprovalOperatorSmokePanel.tsx`
