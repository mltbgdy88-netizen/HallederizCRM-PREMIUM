# UI Agent 08 Report — Settings / Users / ERP / System State

## Branch

| Alan | Değer |
|------|--------|
| Branch | `ui/08-settings-users-erp` |
| Base commit | `ea07c92` — feat(ui): adopt communication reports and ai routes (#131) |
| Commit | `feat(ui): adopt settings users and erp routes` |

## Scope

- Settings/users/ERP/system-state route UI adoption only.
- Stash `wip-mockup-inspiration-before-agent04` **restore edilmedi**.
- Agent 01–08 UI route adoption zinciri bu dalga ile tamamlanmış sayılır.

## Değişen route’lar

| Route | Özet |
|-------|------|
| `/ayarlar` | `SettingsPage` — context band; mevcut kaydet/geri al API davranışı korundu |
| `/ayarlar/*` | `SettingsAreaShell` — context band; alt sayfa mantığı korundu |
| `/kullanicilar` | `UsersManagementPage` — `listUsersApi`, filtre, sağ önizleme, aksiyon kolonu |
| `/kullanicilar/roller` | `RolesManagementPage` — `listRolePresetsApi`, salt okunur matris kartları |
| `/erp` | `ErpPage` — Türkçe copy; Foundation kullanıcı metni kaldırıldı; `getErpIntegrationData` korundu |
| `/offline-api` | `OfflineApiStatePage` — güvenli API kopuk durumu |
| `/demo-mode` | `DemoModeStatePage` — `dataSourceConfig.useDemoData` ile net demo/canlı ayrımı |
| `/live-empty` | `LiveEmptyStatePage` — canlı boş; sahte kayıt yok |

## Değişen dosyalar

**apps/web**

- `app/globals.css` — `agent08-settings-users-erp.css` import
- `app/styles/agent08-settings-users-erp.css` — yeni
- `app/(platform)/kullanicilar/page.tsx`
- `app/(platform)/kullanicilar/roller/page.tsx`
- `app/(platform)/kullanicilar/loading.tsx` — yeni
- `app/(platform)/erp/loading.tsx` — yeni
- `app/(platform)/offline-api/page.tsx` — yeni
- `app/(platform)/demo-mode/page.tsx` — yeni
- `app/(platform)/live-empty/page.tsx` — yeni
- `src/features/users/components/UsersManagementPage.tsx` — yeni
- `src/features/users/components/RolesManagementPage.tsx` — yeni
- `src/features/system-state/components/SystemStatePages.tsx` — yeni
- `src/features/erp/components/ErpPage.tsx`
- `src/features/settings/components/SettingsPage.tsx`
- `src/features/settings/components/SettingsAreaShell.tsx`
- `src/components/platform-shell.tsx` — PageMeta suppress + arama placeholder (kullanıcı/rol/ERP/sistem)

**docs/product**

- `UI_AGENT_08_REPORT.md`
- `UI_ROUTE_COVERAGE_MATRIX.md`
- `UI_INVENTORY_CHECKLIST.md`
- `UI_MOCKUP_IMPLEMENTATION_PLAN.md`

**packages/ui:** değişiklik yok.

## Template adoption

| Template | Kullanım |
|----------|----------|
| `SettingsLayout` | `/ayarlar`, `/ayarlar/*` (mevcut) |
| `EntityListPageTemplate` | `/kullanicilar` |
| `DetailPanel` / `SplitContentLayout` | `/kullanicilar` sağ önizleme (template içi) |
| `PageSection` / kart düzeni | `/kullanicilar/roller`, `/erp` |
| `ProductPageShell` | — |
| `DisabledNotice` | — (disabled buton + `title` kullanıldı) |

## Permission / role / user compliance

| Kontrol | Sonuç |
|---------|--------|
| `listUsersApi` / `listRolePresetsApi` | Korundu; yeni fake kullanıcı/rol yok |
| Davet / rol ata / düzenle | Disabled + güvenli `title`; sahte success yok |
| Permission model / role enum | Değişmedi |
| Forbidden copy scan | Temiz (yasak başarı cümleleri eklenmedi) |

## Business logic preservation

| Alan | Durum |
|------|--------|
| Settings save/revert | `SettingsPage` API akışı korundu |
| Users list | `listUsersApi` korundu |
| Role presets | `listRolePresetsApi` korundu |
| ERP data | `getErpIntegrationData` korundu; sahte connected state eklenmedi |
| Demo config | `dataSourceConfig` salt okundu |
| API/SDK contracts | Korundu |

## Runtime safety

| Kontrol | Sonuç |
|---------|--------|
| PNG runtime import | Yok |
| Fake user/role/permission | Yok |
| Fake ERP sync success | Yok |
| Technical leakage (Failed to fetch, stack, worker, outbox) | Yok |
| Foundation kullanıcı copy (`/erp`) | Kaldırıldı |

## UI state coverage

| Route | loading | empty | error |
|-------|---------|-------|-------|
| `/kullanicilar` | `loading.tsx` + inline | Filtre/liste boş copy | API hata mesajı güvenli |
| `/erp` | `loading.tsx` | Bağlantı yok bandı | — |
| Sistem state | — | `live-empty` | `offline-api` |

## Desktop/Mobile QA

| Kontrol | Sonuç |
|---------|--------|
| 1920×1080 5+ satır (kullanıcı listesi) | Yerelde doğrulanmalı |
| 390×844 mobile | Liste grid 2 kolon kırılımı CSS’te; yerelde doğrulanmalı |
| Sağ panel veri varken boş | İlk kayıt auto-select; yerelde doğrulanmalı |
| Body/yatay scroll | Yerelde doğrulanmalı |

## Test Sonuçları

| Komut | Sonuç |
|-------|--------|
| `pnpm --filter @hallederiz/web typecheck` | Geçti |
| `pnpm --filter @hallederiz/ui typecheck` | Geçti |
| `pnpm --filter @hallederiz/ui build` | Geçti |
| `pnpm --filter @hallederiz/web build` | Geçti (74 sayfa) |
| `pnpm smoke:navigation` | Geçti (24 kontrol) |
| `pnpm smoke:routes` | Geçti (37 route) |

## Known gaps

- `/unauthorized` dedicated route hâlâ yok (auth redirect / inline).
- Kullanıcı davet/düzenle UI — API bağlı tam form sonraki iş paketi.
- ERP filtreler API sorgusuna bağlı değil (bilinçli disabled şablon).
- Görsel QA (emerald yoğunluk, 5+ satır ölçümü) Agent 09.

## Handoff

Agent 09: görsel QA, responsive polish, copy tutarlılığı, route-specific UI bugfix. Backend/API/permission değişikliği yok.
