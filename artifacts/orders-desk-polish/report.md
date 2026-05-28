# Orders Desk Polish QA Report

**Date:** 2026-05-22  
**Route:** `/siparisler`  
**Base URL:** http://localhost:3000

## Polish applied

| # | Item | Result |
|---|------|--------|
| 1 | Profil placeholder (`PAPprofil`) | `ShellUserMenu` — adın ilk kelimesi veya «Hesap» |
| 2 | Para formatı `₺34.200,00` | `formatTryMoney()` liste + önizleme |
| 3 | Tahsilat özeti (Toplam / Tahsil / Kalan + son kayıt) | 3 metrik kutu + boş durum metni |
| 4 | Badge tonları (ödeme / sevkiyat / durum) | emerald / gold / danger / muted / info |
| 5 | Buton hiyerarşisi | Intro: Yeni Sipariş primary; Tahsilat secondary; Preview: Detayı Aç / Tahsilat / Hızlı İşlem |
| 6 | Liste footer | «Toplam N kayıttan 1–N arası gösteriliyor» |
| 7 | Mobile (≤860px) | Intro wrap, tablo yatay scroll, preview tam genişlik aksiyonlar |

## Screenshots

| File | Viewport | Metrics |
|------|----------|---------|
| `orders-1366x768.png` | 1366×768 | desk ✓, policy ✗, overflow ✗, footer ✓ |
| `orders-1920x1080.png` | 1920×1080 | desk ✓, policy ✗, overflow ✗, footer ✓ |
| `orders-mobile.png` | 390×844 | desk ✓, policy ✗, overflow ✗, footer ✓ |

Automated checks (`report.json`): `papProfilLeak: false`, `onayaGonderCopy: false`, `hasPolicyBand: false`.

## Test gates

| Command | Result |
|---------|--------|
| `pnpm ui:guard` | PASS |
| `pnpm --filter @hallederiz/web typecheck` | PASS |
| `pnpm --filter @hallederiz/ui typecheck` | PASS (read-only; no packages/ui file changes) |
| `pnpm --filter @hallederiz/api test` | PASS (423/423) |
| `pnpm --filter @hallederiz/web build` | PASS |
| `pnpm --filter @hallederiz/ui build` | PASS |
| `pnpm smoke:navigation` | PASS (24 links) |
| `pnpm smoke:routes` | PASS (37 routes) |

## Scope guards

- Policy band: not present
- Onaya gönder copy on `/siparisler` desk: none
- packages/ui: not modified
- apps/api / backend: not modified
- pnpm-lock: not modified
- docs/design/ui-design-output: not modified
- Artifacts: not for commit

## Kalan görsel notlar

- «Vadesi geldi/gecikti» rozeti yalnızca `paymentStatus === "overdue"` iken danger; diğer bekleyen ödemeler gold soft.
- 1366×768’de liste satır sayısı piksel doğrulaması CI’da yok; yerelde screenshot ile kontrol edildi.
- `ShellUserMenu` global shell değişikliği — tüm platform rotalarında geçerli.
