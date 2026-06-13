# UI-POLISH Enterprise — Görsel QA Notu

Tarih: 2026-06-11  
Branch: `feature/ui-polish-enterprise`

## Kapsam

- Shell/header pasif arama
- Ticari liste yoğunluğu (pageSize 20)
- Faturalar commercial desk standardı
- ERP/AI readiness merkezi
- Belgeler stateful filtre
- Platform `/` → `/dashboard` yönlendirme

## Viewport kontrol listesi (manuel)

| Viewport | Kontrol | Durum |
|----------|---------|-------|
| 1920×1080 | Body yatay scroll yok | Yerelde doğrulanmalı |
| 1920×1080 | Liste ekranlarında ≥5 satır ilk görünüm | CSS hedefi uygulandı; pixel-perfect doğrulanmadı |
| 1366×768 | Sidebar overlap yok | Yerelde doğrulanmalı |
| 1366×768 | Form sticky footer görünür | Yerelde doğrulanmalı |

## Referans PNG

Workspace'te binary referans PNG yok; manifest (`docs/design/ui-design-output/manifest.json`) mevcut.

## Otomasyon

```bash
node scripts/smoke/visual-ui-polish.cjs
pnpm smoke:navigation
pnpm smoke:routes
```
