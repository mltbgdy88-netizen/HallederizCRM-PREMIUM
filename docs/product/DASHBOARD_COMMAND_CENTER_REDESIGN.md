# Dashboard Command Center Redesign

## Amaç

Ana Sayfa (`/dashboard`) operasyon odaklı komuta merkezi düzenine taşındı; global sol menü zümrüt/altın görünümü standardize edildi.

## Kapsam

- `DashboardCommandCenterPage` — acil uyarılar, görevler, operasyon akışı, son işlemler, hızlı işlem rail
- Sağ rail — AI Asistan + tanıtım video paneli (grafik yok, KPI şeridi yok)
- Sidebar `variant="command-center"` — 14 menü öğesi, Sistem Durumu kartı
- Header dashboard — Ana Sayfa başlığı, Hızlı İşlem, arama, bildirim

## Demo / canlı

- Demo (`useDemoData`): örnek görev, son işlem ve uyarı metrikleri
- Canlı: snapshot sayıları; boş görev/işlem için güvenli metin (sahte başarı yok)

## Test

```bash
pnpm ui:guard
pnpm --filter @hallederiz/web typecheck
pnpm --filter @hallederiz/ui typecheck
pnpm smoke:navigation
```

## Screenshot QA

`artifacts/dashboard-command-center/` (commit dışı)
