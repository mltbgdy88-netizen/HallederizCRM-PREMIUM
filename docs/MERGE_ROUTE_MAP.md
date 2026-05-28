# Merge Route Map

Birleştirme: `hallederizcrm final` UI → `xxxhallederizcrm` (PREMIUM altyapı).

## Sistem route farkları

| Final | PREMIUM (kanonik) |
|-------|-------------------|
| `/arsiv` | `/archive` |
| `/demo` | `/demo-mode` |
| `/empty` | `/live-empty` |
| `/offline` | `/offline-api` |

## Detay / katman route'ları

Final statik mock route'ları birleştirme sandbox'ında korunur (ör. `/cariler/detay`, `/cariler/katman/ozet`).
PREMIUM dynamic route'ları (`/cariler/[customerId]/ozet`) paralel kalır; canlı API fazında mock ID'ler dynamic route'lara yönlendirilecek.

## Alias route'ları

- Sistem: `/arsiv`→`/archive`, `/demo`→`/demo-mode`, `/empty`→`/live-empty`, `/offline`→`/offline-api`
- Katman segment: `/teklifler/katman/siparise-donusturme`→`donusum`; `/siparisler/katman/odeme-tahsilat`→`odeme`; `depo-stok-etkisi`→`depo-stok`
- Legacy: `/approvals`→`/onaylar`, `/ai/insights`→`/ai/icgoruler`, vb.
- Üretim: `node scripts/merge/create-reference-route-aliases.mjs`
- Doğrulama: `node scripts/merge/audit-reference-routes.mjs`

## Kaynak

- Final route listesi: `docs/design/final-reference/ROUTE_MAP.md`
- **Tam envanter (81 + durum):** [`docs/MERGE_UI_INVENTORY.md`](./MERGE_UI_INVENTORY.md) — `node scripts/merge/list-merge-inventory.mjs`
- Wire script: `scripts/merge/wire-reference-routes.mjs`
- Link patch: `scripts/merge/patch-reference-links.mjs`
