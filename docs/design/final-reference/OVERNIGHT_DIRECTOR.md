# Gece Director yetkisi (2026-05-27)

Kullanıcı uyku modunda — **tam QA + onay yetkisi Director’da.**

## Gece planı

1. **Director onayı:** Tüm `qa-pass` → `done` + `DONE_SCREENS.md`
2. **REVIZE ajanı:** Tüm `qa-fail` satırları (mock PNG bire bir)
3. **QA ajanları (4 paralel):** Tüm `qa-review` (~60 ekran)
4. **REVIZE-2 + QA-2:** FAIL kalanlar
5. Kuyruk `#82` `#83` duplicate → `done` (aynı arsiv/raporlar)

## Build kuralı

`pnpm stop-dev` → `pnpm build` (dev kapalı)
