# Approval Inbox — Bileşen Haritası

Future React implementasyonu için önerilen bileşen ayrımı. Stil: **shadcn/ui** primitives + **Tailwind** utility; sayfa özelinde `hz-approvals-*` prefix (mevcut Onaylar sayfası ile uyum). Genel `button` / `div` selector’larından kaçınılır.

**Layout standardı:** Sol **liste** (`minmax(0, 1fr)`) + sağ **detay paneli** (~320–350px); kök `max-width: 1604px`, `height: 100%`, `min-height: 0`, `overflow: hidden`.

**AI Assistant ile birlikte:** Approval Inbox **ayrı route** (`/approvals` / `/onaylar`); tam genişlikli AI hero kolonu yalnızca Dashboard’da. Inbox’ta `ApprovalAiExplanationPanel` (component map dışı ince sarmalayıcı) detay içinde read-only blok; Operator Workspace’te sağ bağlam kolonunda AI özeti inbox seçimine göre güncellenir (bkz. [OPERATOR_WORKSPACE_PRODUCT_SPEC.md](./OPERATOR_WORKSPACE_PRODUCT_SPEC.md)).

---

## ApprovalInboxPage

| Özellik | Tanım |
|---------|--------|
| **Props** | `initialStatus?: string`; `approvalRequestId?: string` (deep link) |
| **Data dependency** | `GET /platform/approvals`; seçili id için `GET /platform/approvals/:id`; opsiyonel audit/outbox read |
| **State** | `filters`, `selectedId`, `list`, `detail`, `refetchToken` |
| **Error** | Sayfa düzeyi hata kartı + liste/detay ayrık hata |
| **Loading** | Liste + detay skeleton; shell PageMeta gizli (sayfa kendi başlığını çizer) |
| **A11y** | `main` landmark; başlık hiyerarşisi; canlı bölge onay sonucu için `aria-live="polite"` |

---

## ApprovalList

| Özellik | Tanım |
|---------|--------|
| **Props** | `items`, `selectedId`, `onSelect`, `isLoading`, `emptyMessage` |
| **Data dependency** | Parent’tan normalize edilmiş approval satırları |
| **State** | İç scroll pozisyonu (opsiyonel) |
| **Error** | `error?: Error` → inline retry |
| **Loading** | 5–8 satır skeleton |
| **A11y** | `role="listbox"` veya tablo `aria-rowcount`; ok tuşları ile seçim |

---

## ApprovalListItem

| Özellik | Tanım |
|---------|--------|
| **Props** | `item`, `selected`, `onSelect` |
| **Data dependency** | `approvalRequestId`, `actionKey`, `requestedBy`, `requestedAt`, `status`, `riskLevel` |
| **State** | Yok (controlled) |
| **Error** | — |
| **Loading** | Tek satır skeleton varyantı |
| **A11y** | `aria-selected`; risk `ApprovalStatusBadge` ile duyurulur |

---

## ApprovalDetailPanel

| Özellik | Tanım |
|---------|--------|
| **Props** | `approvalRequestId`, `detail`, `onRefresh` |
| **Data dependency** | Detay API + entity önizleme resolver |
| **State** | Genişletilmiş audit görünümü (local) |
| **Error** | Detay yüklenemedi kartı |
| **Loading** | Bölümlü skeleton |
| **A11y** | Panel `aria-labelledby` başlık id |

---

## ApprovalRiskSummary

| Özellik | Tanım |
|---------|--------|
| **Props** | `riskLevel`, `auditRequired`, `timelineRequired`, `handlerMode`, `flags` (mutatesState, externalWrite) |
| **Data dependency** | Action registry / detay payload |
| **State** | Daraltılmış/ genişletilmiş (opsiyonel) |
| **Error** | Eksik alan: nötr “risk bilgisi yok” |
| **Loading** | Tek şerit skeleton |
| **A11y** | Kritik risk `role="alert"` |

---

## ApprovalReasonList

| Özellik | Tanım |
|---------|--------|
| **Props** | `reasons: string[] \| ReasonObject[]` |
| **Data dependency** | Policy karar metadata |
| **State** | Yok |
| **Error** | Boş liste: “Gerekçe kaydı yok” |
| **Loading** | Madde skeleton |
| **A11y** | Sıralı liste `ul` / `ol` |

---

## ApprovalActionPreview

| Özellik | Tanım |
|---------|--------|
| **Props** | `actionKey`, `entityType?`, `entityId?`, `payloadPreview?` |
| **Data dependency** | Domain önizleme adapter (read-only) |
| **State** | Yok |
| **Error** | Önizleme yüklenemedi |
| **Loading** | Kart skeleton |
| **A11y** | Hassas tutarlar için `aria-label` |

---

## ApprovalAuditTimelinePreview

| Özellik | Tanım |
|---------|--------|
| **Props** | `approvalRequestId`, `executionId?`, `limit?` |
| **Data dependency** | `GET /audit-events`, `GET /entity-timelines/...` |
| **State** | “Tümünü gör” toggle |
| **Error** | Blok hata, detayın geri kalanı açık |
| **Loading** | Zaman çizelgesi çizgi skeleton |
| **A11y** | Zaman damgası + olay başlığı birlikte okunur |

---

## ApprovalDecisionBar

| Özellik | Tanım |
|---------|--------|
| **Props** | `status`, `canApprove`, `canReject`, `onApprove`, `onReject`, `busy` |
| **Data dependency** | Permission + UI state machine |
| **State** | Red gerekçe modal (local) |
| **Error** | Son karar hatası inline |
| **Loading** | Buton `disabled` + `aria-busy` |
| **A11y** | Onayla birincil; Reddet destructive variant; yüksek riskte `AlertDialog` |

---

## ApprovalStatusBadge

| Özellik | Tanım |
|---------|--------|
| **Props** | `status`, `size?` |
| **Data dependency** | UI state → Türkçe etiket eşlemesi |
| **State** | Yok |
| **Error** | Bilinmeyen durum: nötr “Bilinmiyor” |
| **Loading** | — |
| **A11y** | Renk tek başına bilgi taşımaz; metin zorunlu |

---

## ApprovalOutboxStatus

| Özellik | Tanım |
|---------|--------|
| **Props** | `outboxJobId?`, `jobStatus?`, `attempts?`, `nextRetryAt?`, `idempotencyDuplicate?` |
| **Data dependency** | Outbox read model / approve response metadata |
| **State** | Polling interval (parent) |
| **Error** | Job bilgisi alınamadı |
| **Loading** | Küçük badge skeleton |
| **A11y** | Durum değişiminde kısa canlı bölge özeti |

---

## ApprovalExecutionResult

| Özellik | Tanım |
|---------|--------|
| **Props** | `executionId?`, `result`, `message?`, `retryable?`, `persistenceMode?` |
| **Data dependency** | Execution log / dispatcher sonucu |
| **State** | Mesaj genişletme |
| **Error** | `failed` / `dead_letter` tam yüzey |
| **Loading** | Executing spinner |
| **A11y** | Hata mesajı programatik olarak ilişkilendirilir |

---

## Shadcn / Tailwind yaklaşımı

- **Card, Badge, Button, ScrollArea, Separator, Alert, AlertDialog, Skeleton, Tooltip** — shadcn.
- Tailwind: spacing/radius mevcut CRM token’ları ile (`rounded-lg`, `shadow-sm`, mor vurgu).
- Tablo yoğunluğu: kompakt satır 46–58px bandı; sticky header.
- Karar sonrası toast: mevcut `useToast` pattern; mutation buton disabled-after-success.

---

## Sol liste + sağ detay

```
┌─────────────────────────────────────────────────────────────┐
│ Topbar (filtreler, KPI strip)                                │
├──────────────────────────────┬──────────────────────────────┤
│ ApprovalList                 │ ApprovalDetailPanel          │
│  - ApprovalListItem × N      │  - ApprovalRiskSummary       │
│                              │  - ApprovalReasonList        │
│                              │  - ApprovalActionPreview     │
│                              │  - AI explanation (read-only)│
│                              │  - ApprovalAuditTimeline...  │
│                              │  - ApprovalOutboxStatus      │
│                              │  - ApprovalExecutionResult   │
│                              │  - ApprovalDecisionBar       │
└──────────────────────────────┴──────────────────────────────┘
```

Mobilde liste tam genişlik; detay drawer veya alt route.

---

## AI Assistant paneli ile yan yana çalışma

| Bağlam | Davranış |
|--------|----------|
| **Dashboard** | Tam `DashboardAiAssistantPanel` sağ kolon; inbox öğesine deep link |
| **Approval Inbox** | AI yalnızca seçili onayın açıklama bloğu; mutation yok |
| **Operator Workspace** | Orta kolon inbox veya görev; sağ kolon AI + seçili kayıt özeti senkron |

Inbox implementasyonu Dashboard AI bileşenini **import etmez**; ortak tipografi ve chip dili görsel tutarlılık için yeterlidir.

---

## İlgili dokümanlar

- [APPROVAL_INBOX_PRODUCT_SPEC.md](./APPROVAL_INBOX_PRODUCT_SPEC.md)
- [APPROVAL_INBOX_UI_FLOW.md](./APPROVAL_INBOX_UI_FLOW.md)

## 2026-05-13 — Implemented web components

- `ApprovalInboxShell`, `ApprovalList`, `ApprovalDetailPanel`, `ApprovalActionBar`, `ApprovalStatusBadge`, `ApprovalRiskSummary`, `ApprovalTimelinePreview`, `ApprovalOutboxStatusCard`, `ApprovalSafetyBadge`, `LoadingState`, `EmptyState`, `ErrorState`
- Client foundation: `apps/web/src/features/approvals/api/approval-client.ts`
- UI helpers: `apps/web/src/features/approvals/utils/inbox-helpers.ts`
