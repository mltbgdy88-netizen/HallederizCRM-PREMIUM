# WhatsApp + AI — Belirlenmiş yapı, çalışma biçimi ve kurallar

Bu belge, repoda **yazılı olarak tanımlanmış** WhatsApp otomasyonu ve AI entegrasyon kararlarının indeksidir. Otomatik “insansız” sipariş/tahsilat yürütme **hedeflenmez**; hedef **hibrit (kural + AI + onay)** süreçtir.

---

## 1. Üst seviye strateji (neden böyle?)

| Karar | Kaynak |
|--------|--------|
| WhatsApp akışlarında **hybrid workflow (kural + AI + fallback rules)** | `docs/master-project-spec.md` §3.6 |
| CRM, WhatsApp ve ses AI **aynı operasyon modeli**: bilgi → yanıt; işlem → proposal → onay → execution | `docs/master-project-spec.md` §11, `docs/local-first-ai-decision.md` §3 |
| AI varsayılan **read-only**; mutation **insan onayı** | `docs/master-project-spec.md` §3.4–3.5 |
| Eski `hallederizcrm-wa-clean` reposu: güvenlik, WA workflow, lokal AI **referans** (birebir UI taşınmaz) | `docs/implementation/001-wa-clean-reuse-map.md` |
| Müşteri doğrulama odaklı kanal; barkod/OCR/label pipeline AI operasyonla uyumlu düşünülür | `docs/local-first-ai-decision.md` §5 |

---

## 2. Ortak çalışma modeli (5 adım)

Tüm kanallarda (CRM + WhatsApp + ses) aynı zincir (`docs/local-first-ai-decision.md`):

1. **Bilgi sorusu** → doğrudan yanıt (read-only)
2. **İşlem talebi** → **proposal** oluşturma
3. Özet + **risk notları**
4. **Approval** isteği
5. Onay sonrası **execution** (dispatcher)

**Approval olmadan mutation dispatch edilmez.**

---

## 3. WhatsApp’ta AI ne yapar / ne yapmaz

### Yapmaz (açık yazılı)

| Kural | Kaynak |
|--------|--------|
| AI **doğrudan mesaj göndermez** | `crm-backlog.md` §4 WhatsApp kuralları |
| Gönderim: **policy + approval + outbox** | `crm-backlog.md` §4 |
| **Live gönderim yapmaz**; öneri/onay hattına düşer | `docs/local-sales-ai-assistant-voice-runtime.md` §Omnichannel |
| Otonom AI execution / WhatsApp live auto-send **yapılmaz** (dashboard AI paneli için de geçerli) | `docs/right-rail-ai-assistant-real-ui.md` |
| Provider yoksa **fake success yok**; `degraded` / `not_configured` | `docs/local-sales-ai-assistant-voice-runtime.md` |
| Fiyat/stok görünürlüğü yoksa uydurma veri yok | `docs/local-sales-ai-assistant-voice-runtime.md` §AI'nin Yapamayacağı |
| Omnichannel: AI source ile **direct live send yok** | `docs/omnichannel-inbox-foundation.md` §AI Reply Güvenlik Sınırı |
| Foundation faz: **canlı Meta Graph gönderimi yok**; sahte başarı yok | `docs/development/OMNICHANNEL_SOCIAL_AI_INTEGRATION_REPORT.md` |

### Yapar

| Yetenek | Kaynak |
|---------|--------|
| Müşteri yanıtı için **öneri / taslak** üretir | `docs/local-sales-ai-assistant-voice-runtime.md` |
| **Hazır cevap şablonu** + operatör onayı (`crm-backlog.md`) | UI operasyon paneli |
| Niyet sınıflandırma (`classifySalesIntent`) → iş kuyruğu | `docs/development/OMNICHANNEL_SOCIAL_AI_INTEGRATION_REPORT.md` |
| `ai_reply_suggestions` → `waiting_approval`, `policy_decision: require_approval` | aynı rapor |
| Düşük riskte **auto_reply_low_risk** yalnızca kanal policy + rule resolver izin verirse | `docs/architecture/AI_ACTION_POLICY_MATRIX.md` |

---

## 4. Hibrit çalışma: kural + AI + fallback

**Mod:** `hybrid` (varsayılan rule resolver modu — `packages/domain/src/whatsapp/rule-resolver.ts`)

### Intent matrisi (ürün varsayılanı)

Kaynak: `packages/types/src/whatsapp-intent-rules.ts` (`createDefaultWhatsappIntentRules`) + `docs/implementation/006-whatsapp-security-rules-port.md`

| Intent | Kayıtlı tel + cari | Otomatik cevap | İç onay | Satış onay | Muhasebe onay |
|--------|-------------------|----------------|---------|------------|----------------|
| `stok` | koşullu | koşullu (“kontrol ediyoruz”, SLA; **miktar taahhüdü otomatik değil**) | koşullu | koşullu | hayır |
| `fiyat` | evet | **hayır** | koşullu | **evet** | hayır |
| `siparis` | evet | yalnızca **“talep alındı”**; **sipariş no otomatik üretilmez** | koşullu | **evet** | hayır |
| `odeme` | evet | hayır | hayır | hayır | **evet** |
| `fatura` | evet | hayır | hayır | hayır | **evet** |
| `iade` | evet | hayır | **evet** | koşullu | **evet** |
| `hatali_urun` | evet | hayır | **evet** | koşullu | koşullu |
| `diger` | koşullu | hayır | koşullu | koşullu | koşullu |

**Sipariş şablon metni (örnek):**  
«Sipariş talebinizi aldık. Satış ekibimiz {ürünler} için onay ve termin bilgisini paylaşacak.»

### Kanal policy özeti

`docs/architecture/CHANNEL_ACTION_POLICY_MATRIX.md`:

- Stok/fiyat (kayıtlı müşteri): otomatik cevap veya draft
- Sipariş/ödeme/fatura/iade: **internal approval**; outbound **onay sonrası**
- Bilinmeyen numara: sınırlı auto-reply; **finans yok**
- `ONAY`/`RED`/`İNCELE` + ref + token: hash, yetkili telefon, duplicate audit

---

## 5. Inbound mesaj işleme (webhook) akışı

### Güvenlik (`006-whatsapp-security-rules-port.md`)

- İmza **raw body** üzerinden; secret yoksa verify **asla true dönmez**
- Production: secret yok → **503**; yanlış imza → **403**
- Token raw saklanmaz (hash)

### Idempotency (`007-whatsapp-workflow-foundation.md`)

- Aynı `messageId` tekrar işlenmez (20 sn içerik penceresi)
- Duplicate webhook: `ok: true`, `duplicate: true`, **yeni iş akışı başlatmaz**
- Bu turda **otomatik sipariş/tahsilat/iade execution yapılmaz**

### Komut mesajları (`009-whatsapp-command-approval.md`)

Desteklenen formatlar: `ONAY REF TOKEN`, `RED REF TOKEN`, `İNCELE REF TOKEN` (ve varyantlar).  
Normal müşteri mesajı komut sanılmaz.

Akış: imza → duplicate guard → command parser → ticket doğrulama → audit → **gerçek order/payment execution yok**.

### Omnichannel köprü (`OMNICHANNEL_SOCIAL_AI_INTEGRATION_REPORT.md`)

Inbound WA → `omnichannel_conversations` / `omnichannel_messages` + `ai_reply_jobs` enqueue.  
`classifyMessageJob` → `generateReplySuggestionJob` → onay → (Faz 4B) `send_reply` worker.

---

## 6. Operatör / UI süreci (insan yönetimi)

`crm-backlog.md` §4 — WhatsApp operasyon paneli:

- Sohbet listesi + chat + sağ panel (cari, bakiye, son siparişler, **AI önerileri**)
- Mesaj yaz, hazır cevap, **AI cevap taslağı al**
- Konuşmadan sipariş / teklif / tahsilat hatırlatması **başlat** (proposal/onay zincirine gider)
- `Gonder` → toast + buton pasif (mutation UI kuralı)

`docs/development/UI_REFERENCE_PAGE_GUIDES.md` — operasyon personeli SLA, onaylı fiyat mesajı, şablon kullanımı senaryoları.

---

## 7. Onay sonrası execution (hedef, henüz kademeli)

Onaylanan işlemler dispatcher üzerinden (`docs/ai-proposal-flow.md`, `docs/approval-execution-flow.md`):

- `create_order`, `create_payment`, `create_invoice`, `create_return`, …
- `send_document_whatsapp` (belge WA ile — yine onaylı)

WhatsApp komut onayı ile platform onay masası **aynı fail-closed prensibi** (`docs/architecture/APPROVAL_POLICY_ENGINE.md`).

---

## 8. Bilinçli olarak henüz yapılmayanlar (dokümante)

| Madde | Kaynak |
|--------|--------|
| Full conversational / menu engine | `007`, `008`, `009` |
| WhatsApp Web.js production backbone | `001-wa-clean-reuse-map.md` |
| Otomatik sipariş kesinleştirme WA’dan | `007` webhook notu |
| Gerçek command → execution dispatcher bağlantısı (foundation) | `009` Sonraki iş |
| Meta live outbound / 2B gönderim | `DOCUMENTS_WHATSAPP_DELIVERY_PHASE_2_REPORT.md` |
| Autonomous AI send | `omnichannel-inbox-foundation.md` |
| `ai_reply_jobs` background processor (Faz 4B) | `OMNICHANNEL_SOCIAL_AI_INTEGRATION_REPORT.md` |

---

## 9. Okuma sırası (tam metin)

1. `docs/local-first-ai-decision.md` — genel AI + WA modeli  
2. `docs/architecture/CHANNEL_ACTION_POLICY_MATRIX.md` — kanal × aksiyon  
3. `packages/types/src/whatsapp-intent-rules.ts` — intent şablonları ve onay bayrakları  
4. `docs/implementation/006-whatsapp-security-rules-port.md`  
5. `docs/implementation/007-whatsapp-workflow-foundation.md`  
6. `docs/implementation/009-whatsapp-command-approval.md`  
7. `docs/development/OMNICHANNEL_SOCIAL_AI_INTEGRATION_REPORT.md`  
8. `crm-backlog.md` §4 — ürün/UI beklentisi  
9. `docs/architecture/AI_ACTION_POLICY_MATRIX.md` — `channel.whatsapp.reply`  
10. `docs/local-sales-ai-assistant-voice-runtime.md` — omnichannel AI sınırı  

---

*Bu dosya indeks amaçlıdır; bağlayıcı üst metinler yukarıdaki kaynaklardır.*
