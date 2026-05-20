# UI Mockup Implementation Plan

**Seri başlangıç:** PR #122 merge (`10f2f40`) — live worker + commercial execution foundation  
**Inventory branch:** `ui/00-inventory-scope-guard` (dokümantasyon only)

---

## 1. Executive summary

HallederizCRM web arayüzü, operasyon cockpit’i olarak **emerald/gold** lüks-sade tasarım diline geçirilecek. Bu plan, backend/worker/API/DB’ye dokunmadan yalnızca `apps/web` ve `packages/ui` üzerinde görsel ve layout dönüşümünü fazlar.

- **Agent 00** (bu branch): envanter, coverage matrix, scope guard — **kod yok**.
- **Agent 01–09**: sıralı UI implementation + QA.

Mockup PNG paketi (`docs/design/ui-design-output/**`) **runtime’da import edilmez**; tasarım referansıdır. **Not (2026-05-20):** Paket repoda henüz yok — UI 01 öncesi repoya eklenmeli veya harici read-only mount tanımlanmalı.

---

## 2. Source of truth

| Kaynak | Rol |
|--------|-----|
| `docs/design/ui-design-output/**` | PNG + notes.md (read-only) — **hedef** |
| `docs/product/UI_SCOPE_GUARD.md` | Kapsam ve yasaklar |
| `docs/product/UI_INVENTORY_CHECKLIST.md` | Checklist |
| `docs/product/UI_ROUTE_COVERAGE_MATRIX.md` | 53 route/layer matrisi |
| `.cursor/rules/ui-designer-rules.mdc` | Yoğunluk, scroll, PageMeta, liste kuralları |
| `docs/product/PRODUCTION_ROUTE_MANIFEST.md` | Mevcut route statüleri (`implemented` / `shell` / `needs-api`) |

---

## 3. Mockup-to-code method

```
PNG (referans, import YOK)
  → CSS design tokens (:root emerald/gold)
  → packages/ui primitives (Button, Card, states, …)
  → layout templates (EntityList, EntityDetail, FormPageShell, …)
  → apps/web feature pages (route-by-route)
  → QA: typecheck + smoke:navigation + smoke:routes + viewport
```

**State eşlemesi:**

| Mockup dosya | Uygulama |
|--------------|----------|
| `desktop-default.png` | `page.tsx` ana görünüm |
| `desktop-loading.png` | `loading.tsx` veya `LoadingState` |
| `desktop-empty.png` | `EmptyState` |
| `desktop-error.png` | `error.tsx` veya `ErrorState` |
| `mobile-default.png` | responsive CSS + drawer |
| `desktop-validation-error.png` | form validation summary |
| `desktop-success-or-submitted.png` | `SuccessState` / toast |
| `desktop-detail.png` | `EntityDetailLayout` |
| `desktop-audit-timeline.png` | `EntityTimelinePanel` |
| `desktop-placeholder.png` | `ProductPageShell` |

---

## 4. Branch sequence

| Sıra | Branch | Amaç |
|------|--------|------|
| 00 | `ui/00-inventory-scope-guard` | Inventory + guard (bu doküman seti) |
| 01 | `ui/01-foundation-tokens-primitives` | Tokens + primitives + state components |
| 02 | `ui/02-appshell-sidebar-header` | AppShell, Sidebar, Header, mobile drawer |
| 03 | `ui/03-layout-templates` | List/detail/form/settings templates |
| 04 | `ui/04-platform-operations` | login, dashboard, panel, hızlı işlem, onaylar, workflow |
| 05 | `ui/05-crm-commercial` | cariler, teklif, sipariş, tahsilat, teslimat, iade, fatura |
| 06 | `ui/06-stock-documents-tasks` | stok, depo, fabrika, belgeler, görevler, arşiv, print |
| 07 | `ui/07-communication-reports-ai` | whatsapp, gelen kutu, raporlar, ai |
| 08 | `ui/08-settings-users-erp-common` | ayarlar, kullanıcılar, erp, system states |
| 09 | `ui/09-final-qa-polish` | Full QA, a11y, desktop/mobile pass |

---

## 5. Agent responsibilities

### Agent 01 — `ui/01-foundation-tokens-primitives`

| | |
|--|--|
| **Scope** | Emerald/gold `:root` tokens; primitive export isimleri; Loading/Empty/Error/Success |
| **Allowed** | `packages/ui/**`, `apps/web/app/globals.css` (token blok), `docs/product/DESIGN_TOKENS.md` |
| **Forbidden** | AppShell, route pages, API |
| **Tests** | `web` + `ui` typecheck |
| **Acceptance** | Mor/lacivert primary kaldırıldı; primitives Storybook veya doc örneği (opsiyonel) |

### Agent 02 — `ui/02-appshell-sidebar-header`

| | |
|--|--|
| **Scope** | Sidebar emerald, Header, PageContent, mobile drawer, active nav |
| **Allowed** | `packages/ui/app-shell/**`, `apps/web/src/components/platform-shell.tsx`, shell CSS |
| **Forbidden** | Feature business logic, route içerikleri |
| **Tests** | typecheck + `smoke:navigation` |
| **Acceptance** | Tek sidebar; hamburger 390px; max-width 1604 |

### Agent 03 — `ui/03-layout-templates`

| | |
|--|--|
| **Scope** | EntityListPageTemplate, EntityDetailLayout, FormPageShell, SettingsLayout, DataTableShell, FilterToolbar, DetailPanel (360px), ProductPageShell paylaşımı |
| **Allowed** | `packages/ui/primitives/**`, `product-page-shell` taşıma kararı |
| **Forbidden** | Route-specific KPI/mock data |
| **Tests** | typecheck |

### Agent 04 — `ui/04-platform-operations`

Routes: `/login`, `/dashboard`, `/panel`, `/hizli-islem`, `/onaylar`, `/onaylar/[id]`, `/onaylar/kurallar`, `/workflow/[type]/[id]`

### Agent 05 — `ui/05-crm-commercial`

Routes: cariler, teklifler, siparişler, tahsilatlar, teslimatlar, iadeler, faturalar (+ hub `/yeni` korunur)

### Agent 06 — `ui/06-stock-documents-tasks`

Routes: stok, depo, fabrikalar, belgeler, görevler, archive, print-export davranışı

### Agent 07 — `ui/07-communication-reports-ai`

Routes: whatsapp, gelen-kutu, raporlar, ai/*

### Agent 08 — `ui/08-settings-users-erp-common`

Routes: ayarlar, kullanıcılar, erp + system state sayfaları (unauthorized, offline-api, live-empty)

### Agent 09 — `ui/09-final-qa-polish`

Full smoke, scroll, 5+ satır liste görünümü, hub/AI/content safety audit

---

## 6. Implementation order (teknik)

1. Design tokens (`--hz-color-emerald`, sidebar, gold accent, surface, radius 16px)
2. UI primitives (button, input, card, badge, tabs, modal, drawer, skeleton)
3. Loading / Empty / Error / Success / DisabledNotice
4. AppShell / Sidebar / Header / Mobile Drawer
5. DataTable / FilterToolbar / DetailPanel (360px)
6. EntityListPageTemplate
7. EntityDetailLayout (+ timeline slot)
8. FormPageShell (hub route’larda **kullanılmaz**)
9. Route implementations (Agent 04–08)
10. Final QA (Agent 09)

---

## 7. Route wave plan

| Dalga | Agent | Route grupları |
|-------|-------|----------------|
| Platform | 04 | Auth giriş, dashboard AI kolon, QOP, onay inbox |
| CRM ticari | 05 | Liste + detay + hub yeni + timeline tamamlama |
| Operasyon stok/belge | 06 | Stok, depo, belge, arşiv, görev |
| İletişim & analitik | 07 | WA, inbox, rapor, AI |
| Yönetim | 08 | Ayarlar, kullanıcı/rol, ERP, sistem state |
| QA | 09 | Tümü |

---

## 8. QA gates

**Her UI branch sonu:**

```bash
pnpm --filter @hallederiz/web typecheck
pnpm --filter @hallederiz/ui typecheck
pnpm smoke:navigation
```

**Final UI QA (Agent 09):**

```bash
pnpm --filter @hallederiz/web typecheck
pnpm --filter @hallederiz/ui typecheck
pnpm smoke:routes
pnpm smoke:navigation
```

**Manuel kontrol listesi:**

- [ ] `apps/web/tsconfig.tsbuildinfo` commit dışı
- [ ] Body scroll / yatay scroll yok (1920×1080 — yerelde doğrulanmalı)
- [ ] Mobile 390×844 kırılım
- [ ] Listeli sayfalarda ilk görünümde 5+ satır (ui-designer-rules)
- [ ] Sağ preview veri varken boş değil
- [ ] AI ekranlarında yasak mutation metni yok
- [ ] Hub route’lar form değil
- [ ] Sahte fotoğraf/PDF/harita yok
- [ ] Lorem / teknik hata metni yok

---

## 9. Known gaps (Agent 00 tespiti)

1. **Mockup paketi repoda yok** — `docs/design/ui-design-output/**` eksik; PNG/manifest/notes import edilemiyor.
2. **Legacy renkler** — `globals.css` lacivert/mor-ağırlıklı; emerald planı Agent 01.
3. **App Router `loading.tsx` / `error.tsx`** — 0 dosya; segment state Agent 04+.
4. **Detay timeline** — order, offer, delivery, return, invoice detayında `EntityTimelinePanel` eksik (payment/document/customer/approval var).
5. **System routes** — `unauthorized`, `offline-api`, `live-empty` dedicated page yok (Agent 08).
6. **ProductPageShell yoğunluğu** — manifest `needs-api` alt rotalar catch-all shell; API bağlandıkça REAL’e evrilecek.
7. **Filtre placeholder** — `InvoicesPage` inline filter’da örnek fatura kodu metni (sahte numara hissi) — Agent 05 temizliği.
8. **DESIGN_TOKENS.md** — hâlâ legacy primary/sidebar açıklaması; Agent 01 ile senkron.

---

## 10. Korunan davranışlar (değişmez)

- Backend API contract ve mutation policy
- Onay → worker execution zinciri (UI yalnızca gösterir)
- Quick Operation submit/preview akışı
- Hub route’ların Hızlı İşlem’e yönlendirmesi
- Dashboard’da AI kolonunun yalnızca ana sayfada kalması
- Arşiv kategorilerinin sayfa içi (sidebar alt menü değil)
