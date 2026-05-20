# UI Route Coverage Matrix — 53 route/layer

**Base commit:** `f9943c7` (PR #128) — Agent 05 CRM/commercial routes güncellendi  
**Mockup paketi:** `docs/design/ui-design-output/**` — **repoda yok** (tüm “Mockup” kolonları **MISSING**)

**Implementation type kısaltmaları:**

| Kod | Anlam |
|-----|--------|
| REAL | Feature page (operasyon ekranı) |
| HUB | Hızlı İşlem yönlendirme hub’ı |
| REDIR | Sunucu/istemci redirect |
| CATCH | `renderProductCatchAll` → `ProductPageShell` |
| FORM | Gerçek form sayfası |
| ALIAS | Liste alias redirect |

---

| # | Route / Layer | Expected UI pattern | Mockup folder/status | apps/web status | Current implementation type | Required states | Key UI rules | Target agent | Notes / gaps |
|---|---------------|---------------------|----------------------|-----------------|----------------------------|-----------------|--------------|--------------|--------------|
| 1 | `/login` | Split login shell | MISSING | **Var** `app/login/page.tsx` | REAL | default, loading, validation, mobile | `hz-login-*` split; auth logic korundu | 04 | **Agent 04 tamam** — `UI_AGENT_04_REPORT.md` |
| 2 | `/dashboard` | Operation dashboard + AI kolon | MISSING | **Var** | REAL | default, loading, mobile | 5 ops KPI + AI «İncele» | 04 | **Agent 04 tamam** |
| 3 | `/panel` | Redirect/loading page | MISSING | **Var** | REDIR → `/dashboard` | default, loading | Client spinner + TR copy | 04 | **Agent 04 tamam** |
| 4 | `/hizli-islem` | Quick Operation workbench | MISSING | **Var** | REAL | default, loading, stepper | 4 adım stepper; submit korundu | 04 | **Agent 04 tamam** |
| 5 | `/onaylar` | Entity list + right preview | MISSING | **Var** | REAL | default, loading, empty, error, mobile | Desk inbox + auto-select | 04 | **Agent 04 tamam** |
| 6 | `/onaylar/[id]` | Entity detail + timeline | MISSING | **Var** `[approvalId]` | REAL | detail, audit placeholder | `EntityDetailLayout` | 04 | **Agent 04 tamam**; canlı timeline feed Agent 05+ |
| 7 | `/onaylar/kurallar` | Role permission matrix | MISSING | **Var** | REAL | default, validation (local) | Tablo + sağ panel | 04 | **Agent 04 tamam** |
| 8 | `/whatsapp` | Omnichannel / WA ops | MISSING | **Var** | REAL | default, empty, mobile | Kanal policy UI; mutation CTA yok | 07 | `WhatsAppPage`; `/gelen-kutu/whatsapp` manifest paraleli |
| 9 | `/gelen-kutu` | Omnichannel three-panel inbox | MISSING | **Var** | REAL | default, empty, mobile | Üç panel inbox | 07 | `OmnichannelInboxPage` |
| 10 | `/gelen-kutu/konusma/[id]` | Conversation detail | MISSING | **Var** `[conversationId]` | REAL (kısmi) | detail, mobile | Backend bağlantısı kısmi | 07 | `ConversationPage`; yerelde veri bağlantısı doğrulanmalı |
| 11 | `/cariler` | Entity list + right preview | MISSING | **Var** | REAL | default, empty, mobile | İlk satır seçili / sağ panel dolu | 05 | **Agent 05 tamam** — `CustomersPage` + `EntityListPageTemplate` |
| 12 | `/cariler/[id]` | Entity detail + timeline | MISSING | **Var** `[customerId]` | REAL | detail, audit timeline | `EntityDetailLayout` | 05 | **Agent 05 tamam** |
| 13 | `/cariler/yeni` | FormPageShell | MISSING | **Var** | FORM | validation, submitted | **Gerçek form** (hub değil) | 05 | **Agent 05 tamam** — `CustomerCreatePage` |
| 14 | `/stok` | Entity list + right preview | MISSING | **Var** | REAL | default, empty, mobile | Stok yoğunluk kuralları | 06 | `StockPage` |
| 15 | `/teklifler` | Entity list + right preview | MISSING | **Var** | REAL | default, empty, mobile | — | 05 | **Agent 05 tamam** — `OffersPage` |
| 16 | `/teklifler/[id]` | Entity detail + timeline | MISSING | **Var** `[offerId]` | REAL | detail, audit timeline | `EntityDetailLayout` | 05 | **Agent 05 tamam**; canlı timeline feed sonraki |
| 17 | `/teklifler/yeni` | Hub → Hızlı İşlem | MISSING | **Var** | HUB | default, mobile | **Form değil**; CTA Hızlı İşlem | 05 | **Agent 05 tamam** — `OfferCreateHub` |
| 18 | `/siparisler` | Entity list + right preview | MISSING | **Var** | REAL | default, empty, mobile | — | 05 | **Agent 05 tamam** — `OrdersPage` |
| 19 | `/siparisler/[id]` | Entity detail + timeline | MISSING | **Var** `[orderId]` | REAL | detail, audit timeline | `EntityDetailLayout` | 05 | **Agent 05 tamam** |
| 20 | `/siparisler/yeni` | Hub → Hızlı İşlem | MISSING | **Var** | HUB | default | Form değil | 05 | **Agent 05 tamam** — `OrderCreateHub` |
| 21 | `/tahsilatlar` | Entity list + right preview | MISSING | **Var** | REAL | default, empty, mobile | — | 05 | **Agent 05 tamam** — `PaymentsPage` |
| 22 | `/tahsilatlar/[id]` | Entity detail + timeline | MISSING | **Var** `[paymentId]` | REAL | detail, audit timeline | `EntityTimelinePanel` | 05 | **Agent 05 tamam** |
| 23 | `/tahsilatlar/yeni` | Hub → Hızlı İşlem | MISSING | **Var** | HUB | default | Form değil | 05 | **Agent 05 tamam** — `PaymentCreateHub` |
| 24 | `/teslimatlar` | Entity list + right preview | MISSING | **Var** | REAL | default, empty, loading | `EntityListPageTemplate` | 05 | **Agent 05 tamam** — `DeliveriesPage` |
| 25 | `/teslimatlar/[id]` | Entity detail + timeline | MISSING | **Var** `[deliveryId]` | REAL | detail | `EntityDetailLayout`; harita yok | 05 | **Agent 05 tamam** |
| 26 | `/iadeler` | Entity list + right preview | MISSING | **Var** | REAL | default, empty, loading | — | 05 | **Agent 05 tamam** — `ReturnsPage` |
| 27 | `/iadeler/[id]` | Entity detail + timeline | MISSING | **Var** `[returnId]` | REAL | detail | `EntityDetailLayout` | 05 | **Agent 05 tamam** |
| 28 | `/faturalar` | Entity list + right preview | MISSING | **Var** | REAL | default, empty, loading | Sahte fatura no yok | 05 | **Agent 05 tamam** — `InvoicesPage` |
| 29 | `/faturalar/[id]` | Entity detail + timeline | MISSING | **Var** `[invoiceId]` | REAL | detail | PDF disabled; sahte önizleme yok | 05 | **Agent 05 tamam** |
| 30 | `/depo` | Entity list + detail | MISSING | **Var** | REAL | default, detail | Depo hazırlık fişi | 06 | `WarehouseTasksPage` |
| 31 | `/fabrikalar/*` | Factory list + detail | MISSING | **Var** siparisler + stoklar + `[factoryOrderId]` | REAL | default, detail | `fabrikalar/siparisler`, `stoklar` | 06 | Async server pages |
| 32 | `/belgeler` | Entity list + preview | MISSING | **Var** | REAL | default, empty | — | 06 | `DocumentsPage` |
| 33 | `/belgeler/[id]` | Entity detail + timeline | MISSING | **Var** `[documentId]` | REAL | detail, audit timeline | Timeline ✓ | 06 | `DocumentDetailPage` |
| 34 | `/gorevler` | Task workspace list | MISSING | **Var** | REAL | default, empty | Merkez alias `/gorevler/merkez` | 06 | `TasksPage` |
| 35 | `/gorevler/[id]` | Task detail | MISSING | **Var** `[taskId]` | REAL | detail | — | 06 | Task detail feature |
| 36 | `/archive` | Archive hub + categories | MISSING | **Var** | REAL | default, empty, mobile | Kategori sidebar içinde değil | 06 | `ArchivePage` |
| 37 | `/raporlar` | Report analytics list | MISSING | **Var** | REAL | default, empty | Shell PageMeta gizli | 07 | `ReportsPage` |
| 38 | `/raporlar/[...]` | Report sub-routes | MISSING | **Var** catch-all | CATCH | placeholder | Alt raporlar shell | 07 | `renderProductCatchAll` |
| 39 | `/ai` | AI assistant (read-only) | MISSING | **Var** | REAL | default | **Sidebar’da ayrı AI menü yok** (tam sayfa) | 07 | `AIAssistantPage`; mutation CTA yasak |
| 40 | `/ai/onaylar` | AI approvals bridge | MISSING | **Var** | REAL | default | Onay köprüsü | 07 | `AiApprovalsPage` |
| 41 | `/ai/icgoruler` | AI insights | MISSING | **Var** | REAL | default | Öneri/özet | 07 | `AiInsightsPage` |
| 42 | `/ayarlar` | Settings layout hub | MISSING | **Var** | REAL | default | — | 08 | `SettingsPage` |
| 43 | `/ayarlar/*` | Settings deep routes | MISSING | **Var** + catch-all | REAL / CATCH | default, placeholder | operasyon-gozlem, veri-yukleme REAL | 08 | `[...ayarSlug]` catch-all |
| 44 | `/kullanicilar` | User list | MISSING | **Var** | REAL | default, empty | API list | 08 | `UsersPage` |
| 45 | `/kullanicilar/roller` | Role permission matrix | MISSING | **Var** | REAL | default | — | 08 | `RolesPage` |
| 46 | `/erp` | ERP integration panel | MISSING | **Var** | REAL | default | — | 08 | `ErpPage` |
| 47 | `/workflow/[type]/[id]` | Workflow timeline | MISSING | **Var** | REAL | detail, timeline | `hz-workflow-*` timeline | 04 | **Agent 04 tamam** |
| 48 | `unauthorized` | System state page | MISSING | **Rota yok** | — | error | 401 güvenli copy | 08 | Inline error / auth redirect; dedicated page Agent 08 |
| 49 | `offline-api` | System state page | MISSING | **Rota yok** | — | error | Bağlantı kopuk | 08 | Smoke `api-offline` script var; UI route yok |
| 50 | `demo-mode` | System banner/state | MISSING | **Davranış** | Config | banner | `useDemoData` band | 08 | Global banner; ayrı route opsiyonel |
| 51 | `live-empty` | Empty system state | MISSING | **Rota yok** | — | empty | Canlı boş veri | 08 | Feature-level `EmptyState` |
| 52 | `mobile-drawer` | Shell behavior layer | MISSING | **Davranış** | AppShell | mobile | Hamburger drawer | 02 | `AppShell` mobile sidebar |
| 53 | `print-export` | Print layout layer | MISSING | **Kısmi** | CSS/print | print | Belge yazdır | 06 | Warehouse print copy; dedicated print route yok |

---

## Özet sayılar (53 hedef)

| Metrik | Sayı |
|--------|------|
| apps/web route karşılığı (sayfa veya davranış) | **48** tam + **5** sistem katmanı (dedicated route yok) |
| Eksik dedicated route (48–53) | **3** (`unauthorized`, `offline-api`, `live-empty` sayfa yok) |
| ProductPageShell / CATCH ağırlıklı | **~15+** alt rota (manifest `needs-api` / `shell`) |
| Hub route (teklif/sipariş/tahsilat yeni) | **3** — uyumlu |
| `loading.tsx` / `error.tsx` | **7** platform route loading (Agent 04); `error.tsx` hâlâ 0 |
| Mockup PNG referans | **0** (paket repoda yok) |

---

## Target agent dağılımı (özet)

| Agent | Branch | Route sayısı (bu matris) |
|-------|--------|---------------------------|
| 01 | `ui/01-foundation-tokens-primitives` | 0 route (tokens/primitives) |
| 02 | `ui/02-appshell-sidebar-header` | Layer 52 (mobile-drawer) |
| 03 | `ui/03-layout-templates` | Tüm template tüketicileri |
| 04 | `ui/04-platform-operations` | #1–7, 47 |
| 05 | `ui/05-crm-commercial` | #11–29 |
| 06 | `ui/06-stock-documents-tasks` | #14, 30–36, 53 |
| 07 | `ui/07-communication-reports-ai` | #8–10, 37–41 |
| 08 | `ui/08-settings-users-erp-common` | #42–46, 48–51 |
| 09 | `ui/09-final-qa-polish` | Tümü QA |
