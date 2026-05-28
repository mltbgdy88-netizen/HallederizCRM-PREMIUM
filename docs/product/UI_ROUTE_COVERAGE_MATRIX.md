# UI Route Coverage Matrix — 53 route/layer

**Base commit:** `c1ea097` (PR #130) — Agent 07 communication/reports/AI güncellendi  
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
| 4 | `/hizli-islem` | Quick Operation workbench | MISSING | **Var** | REAL | default, loading, stepper | Sipariş sekmesi ödeme bloğu; sale_order+payment | 04 | **Rework** — ödeme akışı |
| 5 | `/onaylar` | Approval command desk (3-col) | MISSING | **Var** | REAL | default, loading, empty, error, mobile | Queue + detail + decision; policy band; source badges | 04+ | **Command desk redesign** — `APPROVALS_COMMAND_DESK_REDESIGN.md` |
| 6 | `/onaylar/[id]` | Entity detail + timeline | MISSING | **Var** `[approvalId]` | REAL | detail, audit placeholder | `EntityDetailLayout` | 04 | **Agent 04 tamam**; canlı timeline feed Agent 05+ |
| 7 | `/onaylar/kurallar` | Role permission matrix | MISSING | **Var** | REAL | default, validation (local) | Tablo + sağ panel | 04 | **Agent 04 tamam** |
| 8 | `/whatsapp` | Omnichannel / WA ops | MISSING | **Var** | REAL | default, empty, mobile | Provider güvenli; sahte bağlı yok | 07 | **Agent 07 tamam** — `WhatsAppPage` |
| 9 | `/gelen-kutu` | Omnichannel three-panel inbox | MISSING | **Var** | REAL | default, empty, loading, mobile | Üç panel + auto-select | 07 | **Agent 07 tamam** — `OmnichannelInboxPage` |
| 10 | `/gelen-kutu/konusma/[id]` | Conversation detail | MISSING | **Var** `[conversationId]` | REAL | detail, mobile | API mesaj timeline; review-only AI | 07 | **Agent 07 tamam** — `OmnichannelConversationDetailPage` |
| 11 | `/cariler` | Entity list + right preview | MISSING | **Var** | REAL | default, empty, mobile | İlk satır seçili / sağ panel dolu | 05 | **Agent 05 tamam** — `CustomersPage` + `EntityListPageTemplate` |
| 12 | `/cariler/[id]` | Entity detail + timeline | MISSING | **Var** `[customerId]` | REAL | detail, audit timeline | `EntityDetailLayout` | 05 | **Agent 05 tamam** |
| 13 | `/cariler/yeni` | FormPageShell | MISSING | **Var** | FORM | validation, submitted | **Gerçek form** (hub değil) | 05 | **Agent 05 tamam** — `CustomerCreatePage` |
| 14 | `/stok` | Entity list + right preview | MISSING | **Var** | REAL | default, empty, mobile | Stok yoğunluk kuralları | 06 | **Agent 06 tamam** — `StockPage` + `EntityListPageTemplate` |
| 15 | `/teklifler` | Entity list + right preview | MISSING | **Var** | REAL | default, empty, mobile | — | 05 | **Agent 05 tamam** — `OffersPage` |
| 16 | `/teklifler/[id]` | Entity detail + timeline | MISSING | **Var** `[offerId]` | REAL | detail, audit timeline | `EntityDetailLayout` | 05 | **Agent 05 tamam**; canlı timeline feed sonraki |
| 17 | `/teklifler/yeni` | Hub → Hızlı İşlem | MISSING | **Var** | HUB | default, mobile | **Form değil**; CTA Hızlı İşlem | 05 | **Agent 05 tamam** — `OfferCreateHub` |
| 18 | `/siparisler` | Orders operations desk (list + preview) | MISSING | **Var** | REAL | default, empty, loading, mobile | Policy band; payment badges; no approval wording | 05+ | **Orders desk redesign** — `ORDERS_DESK_REDESIGN.md` |
| 19 | `/siparisler/[id]` | Entity detail + timeline | MISSING | **Var** `[orderId]` | REAL | detail, audit timeline | `EntityDetailLayout` | 05 | **Agent 05 tamam** |
| 20 | `/siparisler/yeni` | Hub → Hızlı İşlem | MISSING | **Var** | HUB | default | Form değil | 05 | **Agent 05 tamam** — `OrderCreateHub` |
| 21 | `/tahsilatlar` | Entity list + right preview | MISSING | **Var** | REAL | default, empty, mobile | — | 05 | **Agent 05 tamam** — `PaymentsPage` |
| 22 | `/tahsilatlar/[id]` | Entity detail + timeline | MISSING | **Var** `[paymentId]` | REAL | detail, audit timeline | `EntityTimelinePanel` | 05 | **Agent 05 tamam** |
| 23 | `/tahsilatlar/yeni` | Tahsilat giriş formu | MISSING | **Var** | REAL | default, customer/order query | Canlı create demo blok | 05 | **Rework** — `PaymentCreatePage` |
| 24 | `/teslimatlar` | Entity list + right preview | MISSING | **Var** | REAL | default, empty, loading | `EntityListPageTemplate` | 05 | **Agent 05 tamam** — `DeliveriesPage` |
| 25 | `/teslimatlar/[id]` | Entity detail + timeline | MISSING | **Var** `[deliveryId]` | REAL | detail | `EntityDetailLayout`; harita yok | 05 | **Agent 05 tamam** |
| 26 | `/iadeler` | Entity list + right preview | MISSING | **Var** | REAL | default, empty, loading | — | 05 | **Agent 05 tamam** — `ReturnsPage` |
| 27 | `/iadeler/[id]` | Entity detail + timeline | MISSING | **Var** `[returnId]` | REAL | detail | `EntityDetailLayout` | 05 | **Agent 05 tamam** |
| 28 | `/faturalar` | Entity list + right preview | MISSING | **Var** | REAL | default, empty, loading | Sahte fatura no yok | 05 | **Agent 05 tamam** — `InvoicesPage` |
| 29 | `/faturalar/[id]` | Entity detail + timeline | MISSING | **Var** `[invoiceId]` | REAL | detail | PDF disabled; sahte önizleme yok | 05 | **Agent 05 tamam** |
| 30 | `/depo` | Entity list + detail | MISSING | **Var** | REAL | default, detail | Depo hazırlık fişi; harita yok | 06 | **Agent 06 tamam** — `WarehouseTasksPage` |
| 31 | `/fabrikalar/*` | Factory list + detail | MISSING | **Var** siparisler + stoklar + `[factoryOrderId]` | REAL | default, detail | `EntityListPageTemplate` + detail layout | 06 | **Agent 06 tamam** |
| 32 | `/belgeler` | Entity list + preview | MISSING | **Var** | REAL | default, empty | `EntityListPageTemplate` | 06 | **Agent 06 tamam** — `DocumentsPage` |
| 33 | `/belgeler/[id]` | Entity detail + timeline | MISSING | **Var** `[documentId]` | REAL | detail, audit timeline | `EntityDetailLayout`; güvenli PDF | 06 | **Agent 06 tamam** |
| 34 | `/gorevler` | Task workspace list | MISSING | **Var** | REAL | default, empty | Workspace korundu | 06 | **Agent 06 tamam** — `TasksPage` |
| 35 | `/gorevler/[id]` | Task detail | MISSING | **Var** `[taskId]` | REAL | detail | `EntityDetailLayout` | 06 | **Agent 06 tamam** |
| 36 | `/archive` | Archive hub + categories | MISSING | **Var** | REAL | default, empty, mobile | Referans layout korundu | 06 | **Agent 06 tamam** — `ArchivePage` |
| 37 | `/raporlar` | Report analytics list | MISSING | **Var** | REAL | default, empty, loading | Canlı modda sahte grafik yok | 07 | **Agent 07 tamam** — `ReportsPage` |
| 38 | `/raporlar/[...]` | Report sub-routes | MISSING | **Var** catch-all | REAL | empty, loading, error | `ReportDetailPage` safe shell; fake chart yok | 10 | **Hardening tamam** — audit gap closure |
| 39 | `/ai` | AI assistant (read-only) | MISSING | **Var** | REAL | default, loading | Hub + review-only | 07 | **Agent 07 tamam** — `AIAssistantPage` |
| 40 | `/ai/onaylar` | AI approvals bridge | MISSING | **Var** | REAL | default | Onay ekranına git | 07 | **Agent 07 tamam** — `AiApprovalsPage` |
| 41 | `/ai/icgoruler` | AI insights | MISSING | **Var** | REAL | default | Salt okunur kartlar | 07 | **Agent 07 tamam** — `AiInsightsPage` |
| 42 | `/ayarlar` | Settings layout hub | **08 tamam** | **Var** | REAL | default | `SettingsLayout` + context band | 08 | **Agent 08 tamam** — `SettingsPage` |
| 43 | `/ayarlar/*` | Settings deep routes | **08 tamam** | **Var** + catch-all | REAL / CATCH | default, placeholder | `SettingsAreaShell` context band | 08 | **Agent 08 tamam** |
| 44 | `/kullanicilar` | User list | **08 tamam** | **Var** | REAL | default, empty, loading | `EntityListPageTemplate`; `listUsersApi` | 08 | **Agent 08 tamam** — `UsersManagementPage` |
| 45 | `/kullanicilar/roller` | Role permission matrix | **08 tamam** | **Var** | REAL | default | `listRolePresetsApi`; salt okunur | 08 | **Agent 08 tamam** — `RolesManagementPage` |
| 46 | `/erp` | ERP integration panel | **08 tamam** | **Var** | REAL | default, loading | Türkçe; Foundation copy kaldırıldı | 08 | **Agent 08 tamam** — `ErpPage` |
| 47 | `/workflow/[type]/[id]` | Workflow timeline | MISSING | **Var** | REAL | detail, timeline | `hz-workflow-*` timeline | 04 | **Agent 04 tamam** |
| 48 | `/unauthorized` | System state page | MISSING | **Var** `app/(platform)/unauthorized/page.tsx` | STATE | error | Güvenli erişim copy; auth logic değişmedi | 10 | **Hardening tamam** |
| 49 | `/offline-api` | System state page | **08 tamam** | **Var** | STATE | error | Güvenli API kopuk copy | 08 | **Agent 08 tamam** — `OfflineApiStatePage` |
| 50 | `/demo-mode` | System banner/state | **08 tamam** | **Var** + Config | STATE | banner | `dataSourceConfig.useDemoData` | 08 | **Agent 08 tamam** — `DemoModeStatePage` |
| 51 | `/live-empty` | Empty system state | **08 tamam** | **Var** | STATE | empty | Canlı boş; sahte kayıt yok | 08 | **Agent 08 tamam** — `LiveEmptyStatePage` |
| 52 | `mobile-drawer` | Shell behavior layer | MISSING | **Davranış** | AppShell | mobile | Hamburger drawer | 02 | `AppShell` mobile sidebar |
| 53 | `print-export` | Print layout layer | MISSING | **Kısmi** | CSS/print | print | `.hz-print-export-panel` + depo print | 06 | **Agent 06 tamam** (layer; ayrı route yok) |

---

## Özet sayılar (53 hedef)

| Metrik | Sayı |
|--------|------|
| apps/web route karşılığı (sayfa veya davranış) | **48** tam + **5** sistem katmanı (dedicated route yok) |
| Eksik dedicated route (48–53) | **0** (`/unauthorized` eklendi; offline/demo/live-empty Agent 08) |
| ProductPageShell / CATCH ağırlıklı | **~14** alt rota (raporlar detay hariç) |
| Hub route (teklif/sipariş/tahsilat yeni) | **3** — uyumlu |
| `loading.tsx` / `error.tsx` | **8+** loading; **9** segment `error.tsx` (Agent 10 hardening) |
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
| 09 | `ui/09-visual-qa-polish` | Tümü visual QA — **Agent 09 tamam** |
