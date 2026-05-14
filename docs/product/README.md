# Product Documentation

Ürün vizyonu, onay inbox’ı, operatör workspace ve modül kapsamları.

## Operasyon ve release (web)

- Route: `/ayarlar/operasyon-gozlem` — trace/tenant korelasyonu, release/pilot checklist özeti, haftalık pilot geri bildirimi şablonu (salt okunur / demo veri).
- Üretim yürütme kuyruğu (Faz A–G): [PRODUCTION_EXECUTION_QUEUE.md](../development/PRODUCTION_EXECUTION_QUEUE.md).

## Approval Inbox ve operatör yüzeyi

| Doküman | Açıklama |
|---------|----------|
| [APPROVAL_INBOX_PRODUCT_SPEC.md](./APPROVAL_INBOX_PRODUCT_SPEC.md) | Onay inbox amacı, roller, alanlar, filtreler, güvenlik UX |
| [APPROVAL_INBOX_UI_FLOW.md](./APPROVAL_INBOX_UI_FLOW.md) | Route’lar, kullanıcı akışları, policy→worker zinciri, UI state machine |
| [APPROVAL_INBOX_COMPONENT_MAP.md](./APPROVAL_INBOX_COMPONENT_MAP.md) | Bileşen önerileri, props, layout, shadcn/Tailwind |
| [OPERATOR_WORKSPACE_PRODUCT_SPEC.md](./OPERATOR_WORKSPACE_PRODUCT_SPEC.md) | Operatör cockpit; onay, AI, omnichannel, timeline, görev ilişkisi |

## Diğer ürün dokümanları

| Doküman | Açıklama |
|---------|----------|
| [quick-operation-center.md](./quick-operation-center.md) | Hızlı İşlem merkezi ürün notları |
| [UI_INVENTORY_CHECKLIST.md](./UI_INVENTORY_CHECKLIST.md) | Route tabanlı UI envanteri (görev 01); on gruba ayrılmış checklist |
| [DESIGN_TOKENS.md](./DESIGN_TOKENS.md) | Ortak design token referansı (görev 02); `globals.css` ile senkron |
| [UI_PRIMITIVES.md](./UI_PRIMITIVES.md) | `@hallederiz/ui` primitive bileşenleri ve `hz-ui-*` sınıf özeti (görev 03) |
| [APPSHELL_LAYOUT.md](./APPSHELL_LAYOUT.md) | AppShell, `PageContent`, split layout sözleşmesi (görev 04) |
| [UI_LAYOUT_PATTERNS.md](./UI_LAYOUT_PATTERNS.md) | Filtre bandı, tablo kabuğu, liste/detay/rapor/ayar şablonları (05–07, 12, 15, 17, 19–20) |
| [UI_SCREENS_IMPLEMENTATION_BACKLOG.md](./UI_SCREENS_IMPLEMENTATION_BACKLOG.md) | Ekran bazlı sıradaki işler (08–11, 13–14, 16, 18, 22) |
| [UI_TRANSFORMATION_TASKS.md](./UI_TRANSFORMATION_TASKS.md) | UI dönüşüm programı kanonik görev backlog’u (Tasks 01–22) |

## Üst seviye referanslar

- [master-project-spec.md](../master-project-spec.md)
- [module-map.md](../module-map.md)
- [approval-execution-flow.md](../approval-execution-flow.md)
- [ai-operator-mode.md](../ai-operator-mode.md)
