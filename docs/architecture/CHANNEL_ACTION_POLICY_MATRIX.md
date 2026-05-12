# Channel Action Policy Matrix

Omnichannel yüzeylerinde action, **channel policy** + Action Registry + Approval ile değerlendirilir.

## Ortak kontroller

- İzinli / yasaklı action listesi (kanal başına)  
- Otomatik cevap: yalnızca düşük risk + şablon + feature açık  
- İnsan onayı: finansal, sipariş, iade, fiyat, belge gönderimi  
- Handoff: belirsiz niyet, yüksek risk, mesai dışı (tenant config)  
- KVKK / iletişim izni  
- Provider health, rate limit, messaging window  
- Webhook: signature, duplicate guard, idempotency, expiry  
- Audit/timeline zorunlu (outbound ve onay komutları)

## WhatsApp

| Durum | Policy |
|-------|--------|
| Stok/fiyat bilgi (kayıtlı müşteri) | Otomatik cevap veya draft; intent `stok`/`fiyat` |
| Sipariş/ödeme/fatura/iade | Internal approval; outbound onay sonrası |
| ONAY/RED/İNCELE + ref + token | Token hash; yetkili telefon; duplicate audit |
| Bilinmeyen numara | Sınırlı auto-reply; finans yok |

Transport: raw body signature; prod secret yok → 503 (`006-whatsapp-security-rules-port.md`).

## Instagram / Facebook

| Durum | Policy |
|-------|--------|
| Lead toplama | Audit; KVKK; handoff eşiği düşük |
| Ürün önerme | draft_only; fiyat kesin değil |
| Kampanya yönlendirme | template + rate limit |
| Sipariş/ödeme niyeti | handoff + approval ticket |
| Temsilci aktarım | `require_handoff` default |

## Web Chat

- Oturum bağlı müşteri; PII minimizasyonu  
- Dosya/belge: virus scan + approval  
- Rate limit: tenant başına concurrent chat

## Email / SMS

- Toplu gönderim: approval + plan limit  
- Finansal içerik: yüksek risk  
- Unsubscribe / izin kaydı zorunlu

## Kanal × action (özet)

| actionKey | WA | IG | FB | Web | Email | SMS |
|-----------|----|----|-----|-----|-------|-----|
| `channel.*.reply` (bilgi) | auto* | draft | draft | auto* | — | — |
| `quote.send` | approval | handoff | handoff | approval | approval | approval |
| `order.confirm` | approval | blocked | blocked | handoff | blocked | blocked |
| `document.send` | approval | handoff | handoff | approval | approval | approval |
| `finance.payment.create` | approval | blocked | blocked | blocked | blocked | blocked |

\* Rule resolver + müşteri eşleşmesi.

## Mevcut kod

`integrations/routes.ts` (webhook, idempotency), `whatsapp/rule-resolver.ts`, `command-parser.ts`.

Hedef: channel policy evaluator + tenant routing (phone_number_id → tenantId).
