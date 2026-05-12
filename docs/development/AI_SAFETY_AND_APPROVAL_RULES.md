# AI güvenliği ve onay kuralları

Bu doküman geliştirme sırasında bağlayıcı özetidir. Üst spec: `docs/master-project-spec.md`, `docs/local-first-ai-decision.md`.

## AI yetkisi

**Yapabilir:** read-only analiz; özet; risk notu; proposal/taslak; onay talebi.

**Yapamaz:** doğrudan kritik mutation; approval/permission/tenant bypass.

## İnsan onayı zorunlu işlemler

- Fiyat ve iskonto değişimi  
- Sipariş kesinleştirme  
- Tahsilat  
- Fatura  
- İade  
- Stok düşme / depo hazırlık kesinleştirme  
- ERP write  
- Fabrika siparişi  
- Teslim tamamlama  
- Yüksek riskli mesaj ve belge gönderimi (WhatsApp vb.)  

Örnek execution aksiyonları: `create_order`, `create_payment`, `create_invoice`, `create_return`, `complete_delivery`, `send_document_whatsapp`, `queue_document_save`, `queue_document_print` — `docs/ai-proposal-flow.md`.

## Zincir

1. Kullanıcı / kanal girdisi  
2. Context + (local-first) LLM  
3. Structured proposal  
4. Mutation ise `waiting_approval`  
5. İnsan onay/red  
6. **Execution dispatcher** → domain servisi  
7. **Audit + timeline** (+ outbox/queue)  

## Runtime ve fallback

Öncelik: local → external → safe fallback. Fallback mutation execute etmez; UI’da servis durumu görünür. Production’da eksik kritik config → fail-closed.

## Kanal

WhatsApp ve diğer kanallar: rule resolver + permission; webhook signature, duplicate guard, expiry, token hash.

## Test

Approval policy, proposal snapshot, execution deny without approval, audit write — ilgili PR’da zorunlu.
