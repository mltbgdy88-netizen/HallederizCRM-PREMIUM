# UI Agent 04 Report — Platform / Operations Routes

## Branch

| Alan | Değer |
|------|--------|
| Branch | `ui/04-platform-operations` |
| Base commit | `3fa7c74` — feat(ui): add layout template foundation (#127) |
| Commit | *(yerel — `feat(ui): adopt platform operations routes`)* |

## Scope

- Platform/operations route UI adoption only.
- Preflight: önceki WIP `git stash` ile temizlendi (`wip-mockup-inspiration-before-agent04`).

## Değişen route’lar

| Route | Özet |
|-------|------|
| `/login` | Split screen (`hz-login-*`), client validation, güvenli hata/loading |
| `/dashboard` | 5 sabit operasyon KPI şeridi, AI yalnızca «İncele» CTA |
| `/panel` | Zümrüt spinner + Türkçe yönlendirme metni (client `replace`) |
| `/hizli-islem` | 4 adımlı `QuickOperationStepper` |
| `/onaylar` | Mevcut desk inbox korundu; loading segment |
| `/onaylar/[id]` | `EntityDetailLayout`, Türkçe copy, güvenli hata |
| `/onaylar/kurallar` | Tablo + sağ düzenleme paneli, yerel doğrulama |
| `/workflow/[type]/[id]` | `hz-workflow-*` timeline görünümü |

## Değişen dosyalar

**apps/web**

- `app/globals.css` — `agent04-platform.css` import
- `app/styles/agent04-platform.css` — yeni
- `app/login/page.tsx`, `app/login/loading.tsx`
- `app/(platform)/panel/page.tsx`, `loading.tsx`
- `app/(platform)/dashboard/loading.tsx`
- `app/(platform)/hizli-islem/loading.tsx`
- `app/(platform)/onaylar/loading.tsx`
- `src/features/panel/components/PanelRedirectClient.tsx`
- `src/features/dashboard/components/DashboardHomePage.tsx`
- `src/features/dashboard/components/DashboardAiAssistantPanel.tsx`
- `src/features/quick-operations/components/QuickOperationPage.tsx`
- `src/features/quick-operations/components/QuickOperationStepper.tsx`
- `src/features/approvals/components/ApprovalsPage.tsx`
- `src/features/approvals/components/ApprovalPolicyMatrixPage.tsx`
- `src/features/workflows/components/WorkflowTimelinePage.tsx`

**docs/product**

- `UI_AGENT_04_REPORT.md` (bu dosya)
- `UI_ROUTE_COVERAGE_MATRIX.md`
- `UI_INVENTORY_CHECKLIST.md`
- `UI_MOCKUP_IMPLEMENTATION_PLAN.md`

**packages/ui:** değişiklik yok.

## Template adoption

| Template | Kullanım |
|----------|----------|
| `EntityListPageTemplate` | — (onaylar mevcut desk layout korundu) |
| `EntityDetailLayout` | `/onaylar/[id]` |
| `FormPageShell` | — |
| `DetailPanel` | Mevcut `ApprovalInboxDetailPanel` |
| `PageHeader` | Onay detay, workflow |
| `MetricCard` | Dashboard KPI linkleri, workflow özet |
| `SplitContentLayout` | Dashboard ana + AI kolon (mevcut) |
| `UiButton` | Login submit |

## Business logic preservation

| Alan | Durum |
|------|--------|
| Auth/session | `useAuth`, `login()`, `next` param, Suspense korundu |
| Dashboard data | `getDashboardHomeSnapshot` / `getDashboardLiveSnapshot` korundu |
| Quick Operation | `useQuickOperationState`, preview/submit korundu |
| Approval mutations | approve/reject/execute zinciri korundu |
| Rules | `listPolicyActions()` domain kaynağı; canlı save yok |
| Workflow | `getWorkflowByEntity` server loader korundu |
| API/SDK | Contract değişmedi |

## No fake behavior

- Yeni sahte KPI sayısı, müşteri veya başarı mesajı eklenmedi.
- Policy «Doğrula» yalnızca yerel not uzunluğu kontrolü; canlı API success simülasyonu yok.
- AI öneri CTA: yalnızca «İncele»; mutation copy yok.

## Runtime PNG import scan

```text
rg ui-design-output|desktop-default.png apps/web packages/ui → 0 eşleşme
```

## Technical leakage scan

- Login/onay detay catch bloklarında ham `Error.message` kullanıcıya gösterilmiyor.
- Worker/outbox jargonu eklenmedi.

## Desktop / mobile

| Kontrol | Sonuç |
|---------|--------|
| 1920×1080 — onaylar 5+ satır | Yerelde doğrulanmalı (mevcut desk yoğunluğu korundu) |
| 390×844 mobile | Login tek kolon; KPI 2 kolon; policy/workflow stack |
| Sağ panel boş (onaylar) | Mevcut auto-select korundu |
| Body / yatay scroll | Yerelde doğrulanmalı |

## Tests

| Komut | Sonuç |
|-------|--------|
| `pnpm --filter @hallederiz/web typecheck` | Geçti |
| `pnpm --filter @hallederiz/ui typecheck` | Geçti |
| `pnpm --filter @hallederiz/ui build` | Geçti |
| `pnpm --filter @hallederiz/web build` | Geçti |
| `pnpm smoke:navigation` | Geçti (panel dosyasında `redirect("/dashboard")` referans yorumu) |
| `pnpm smoke:routes` | Geçti |

## Known gaps

- Onaylar listesi `EntityListPageTemplate` tam adopt değil (desk layout yeterli kabul).
- Workflow timeline gerçek audit event feed bekliyor (adım listesi workflow steps).
- Dashboard seçili kartlar bölümü KPI şeridinden ayrı kaldı (özelleştirme).

## Agent 05 handoff

- CRM/commercial: `/cariler`, `/stok`, teklif/sipariş/tahsilat/teslimat/iade/fatura.
- Hub route’lar form değil; Hızlı İşlem hub CTA korunmalı.
- `ui/05-crm-commercial` branch’i `main` üzerinden temiz ağaç ile başlanmalı.
