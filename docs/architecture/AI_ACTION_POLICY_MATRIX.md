# AI Action Policy Matrix

AI **asla** kritik mutation’ı onaysız icra etmez. Bu matris `PolicyEngine` + `Action Registry` için `aiMode` ve otonomi tavanını tanımlar.

## AI modları

| Mod | Açıklama |
|-----|----------|
| `read_only` | Özet/analiz; mutation yok |
| `summarize` | Konuşma/işlem özeti |
| `draft` | Mesaj/belge taslağı; gönderim yok |
| `propose` | Yapılandırılmış proposal |
| `request_approval` | Onay kaydı zorunlu |
| `auto_reply_low_risk` | Yalnızca kanal policy izin verirse |
| `handoff` | İnsan operatöre |
| `blocked` | AI yüzeyi kapalı |

## AI yapabilir (read / draft / propose)

Müşteri/sipariş/konuşma özeti; stok yorumu; risk analizi; teklif önerisi; mesaj taslağı; tahsilat hatırlatma taslağı; operasyon önerisi; niyet/şikayet algılama; gecikme riski; talep tahmini; workflow önerisi.

## AI yapamaz (execution)

Fiyat/iskonto değişimi; sipariş kesinleştirme; tahsilat; fatura; iade kabul; ERP write; fabrika siparişi; stok düşme; KVKK silme/export; yüksek riskli mesaj gönderimi.

## Action matrisi (özet)

| actionKey | AI mode | requiresPermission | requiresApproval | maxAutonomy | risk | confidence min | channels | audit | fallback |
|-----------|---------|------------------|------------------|-------------|------|----------------|----------|-------|----------|
| `customer.read` (özet) | summarize | `ai.proposal.read` | Hayır | read_only | low | 0.5 | crm_ui, whatsapp* | Evet | handoff |
| `order.read` (özet) | summarize | `ai.proposal.read` | Hayır | read_only | low | 0.5 | crm_ui | Evet | deny |
| `ai.message.draft` | draft | `ai.proposal.create` | Hayır | draft | low | 0.6 | crm_ui, wa, ig, fb | Evet | draft_only |
| `quote.discount.apply` | request_approval | `ai.proposal.create` | Evet | propose | critical | 0.85 | crm_ui | Evet | require_approval |
| `order.confirm` | request_approval | `ai.proposal.create` | Evet | propose | critical | 0.9 | crm_ui | Evet | require_approval |
| `finance.payment.create` | request_approval | `ai.proposal.create` | Evet | propose | critical | 0.9 | crm_ui | Evet | require_approval |
| `invoice.create` | request_approval | `ai.proposal.create` | Evet | propose | critical | 0.9 | crm_ui | Evet | require_approval |
| `stock.adjust` | blocked | — | Evet | blocked | critical | — | — | Evet | deny |
| `erp.sync.write` | blocked | — | Evet | blocked | critical | — | — | Evet | deny |
| `channel.whatsapp.reply` | auto_reply_low_risk | `ai.proposal.create` | Koşullu | draft | medium | 0.75 | whatsapp | Evet | handoff |
| `document.send` | request_approval | `ai.proposal.create` | Evet | propose | high | 0.85 | crm_ui, wa | Evet | require_approval |
| `ai.proposal.create` | propose | `ai.proposal.create` | Koşullu | propose | medium | 0.7 | tümü | Evet | require_approval |
| `ai.action.propose` | request_approval | `ai.proposal.create` | Evet | propose | high | 0.8 | tümü | Evet | require_approval |

\* WhatsApp’ta yalnızca müşteri bağlamı + rule resolver `canAutoReply`.

## Mevcut kod

- `classifyAiRequest` / `mutationActions` — sabit liste  
- `validateAiMutationGuard` — approval status kontrolü  
- `requiresApproval` proposal alanı  

Hedef: matris registry’den; confidence/risk Policy Engine’de.

## Fallback

Provider `unavailable` → `draft_only` veya `deny`; mutation execute edilmez (`fallback-behavior.md`).
