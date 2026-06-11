# Proje kararları ve planlar — tam envanter

**Amaç:** Kodlamadan önce repoda yazılı olan tüm kurallar, iş akışları, AI sınırları, entegrasyon planları ve UI kararlarının tek listede toplanması.  
**Kaynak:** `docs/`, `crm-backlog.md`, `.cursor/rules/`, `AGENTS.md`, `packages/domain` (dokümantasyon referansları).  
**Not:** Bu liste **plan/karar** özetidir; her maddenin uygulama durumu (kodda tam/kısmi) ayrıca `UI_MASTER_DESIGN_BACKLOG.md` ve faz raporlarında izlenir.

---

## 1. Ürün sınırı ve genel hedef

| Karar | Kaynak |
|--------|--------|
| Çok kiracılı kurumsal CRM + operasyon platformu (duvar kağıdı / B2B ticaret odaklı) | `docs/master-project-spec.md`, `.cursor/rules/00-project-context.mdc` |
| Kanonik veri **PostgreSQL**; web = iç personel **cockpit** (masaüstü uygulama hissi) | `docs/master-project-spec.md` |
| **Dış bayi/müşteri web portalı yok** (bu repo kapsamında) | `docs/master-project-spec.md`, `.cursor/rules/00-project-context.mdc` |
| Kontrolsüz otomasyon yok; tenant’sız “global admin” kısayolu yok | `.cursor/rules/00-project-context.mdc` |
| UI dili backend motorundan **önce kilitlenmeli** | `docs/DECISIONS.md` |
| Ürün dili: sakin, premium, kurumsal, operasyonel; demo dashboard hissi **kaçınılır** | `docs/DECISIONS.md` |
| Ana operasyon yüzeyi **Hızlı İşlem**; dashboard KPI vitrini değil | `docs/DECISIONS.md`, `docs/master-project-spec.md` |
| İş listesi yerine önceliklendirilmiş **görev/operasyon merkezi** yaklaşımı | `docs/master-project-spec.md` |
| Paketleme hedefi: Core / Operations / Automation (WA, workflow) / Intelligence | `docs/master-project-spec.md` |

---

## 2. UI / shell / navigasyon kararları

| Karar | Kaynak |
|--------|--------|
| Sol sidebar: koyu yeşil / lacivert; üstte **büyük logo**; aktif menü altın vurgu | `.cursor/rules/ui-rules.mdc`, `docs/product/UI_APPSHELL_LAYOUT.md` |
| Ana menü: Gösterge Paneli, Hızlı İşlem, Onaylar, WhatsApp, Cariler, Ürün/Stok, Arşiv, Raporlar, Ayarlar | `.cursor/rules/ui-rules.mdc`, `crm-backlog.md` |
| **Tek sidebar** kaynağı; ikinci sidebar yok | `docs/product/UI_APPSHELL_LAYOUT.md` |
| Sidebar’da **AI ayrı menü öğesi yok**; AI ayarları **Ayarlar** altında | `crm-backlog.md`, `.cursor/rules/ui-designer-rules.mdc` |
| **Arşiv:** sol menüde alt menü **açılmaz**; kategoriler **sayfa içi** iri yatay butonlar | `crm-backlog.md`, `.cursor/rules/ui-rules.mdc` |
| Arşiv kategorileri: Teklifler, Siparişler, Tahsilatlar, Teslimatlar, İadeler, Faturalar, Belgeler | `crm-backlog.md` |
| Geçmiş sipariş/tahsilat/teslimat/iade → **arşiv mantığı** (Hızlı İşlem = yeni fiş merkezi) | `.cursor/rules/00-project-context.mdc` |
| Tasarım dili geçişi: **zümrüt / altın / krem** (`#fdfcf9`); mor SaaS / eski gradient **hedef dışı** | `docs/product/UI_DESIGN_LANGUAGE_EMERALD_GOLD.md`, `.cursor/rules/10-reference-design-fidelity.mdc` |
| Mobile ≤1180px: drawer; Escape, backdrop, body scroll lock | `docs/product/UI_APPSHELL_LAYOUT.md` |
| Kendi başlıklı sayfalarda shell **PageMeta gizli** (`suppressPageMeta`) | `.cursor/rules/ui-designer-rules.mdc` |
| Dış layout: max-width **1604px**, height 100%, overflow hidden; **body / yatay scroll yok** | `.cursor/rules/ui-designer-rules.mdc` |
| CSS yalnız sayfa prefix’i (`.hz-stock-*`, `.hz-customers-*`, …); global `button`/`div` selector yok | `.cursor/rules/ui-designer-rules.mdc` |
| PNG mockup runtime’da **import edilmez**; yalnız tasarım referansı | `docs/product/UI_SCOPE_GUARD.md` |
| UI agent’ları `apps/api`, `packages/database`, `packages/domain`, auth’a **dokunmaz** | `docs/product/UI_SCOPE_GUARD.md`, `.cursor/rules/safety-rules.mdc` |

---

## 3. Dashboard ve AI kolonu yerleşimi

| Karar | Kaynak |
|--------|--------|
| Dashboard **KPI vitrini değil**; sonraki iş ve hızlı yön | `docs/DECISIONS.md` |
| **Tam AI kolonu yalnızca** `/dashboard` ana sayfasında | `crm-backlog.md`, `.cursor/rules/ui-rules.mdc` |
| Diğer sayfalarda sağ **AI chat kolonu açılmaz**; küçük özet/uyarı kartları olabilir | `.cursor/rules/ui-designer-rules.mdc` |
| AI üst alan: **video-capable display** (play, timeline, kontroller); görsel yükleme kutusu değil | `crm-backlog.md`, `.cursor/rules/ui-rules.mdc` |
| Dashboard: operasyon akışı + sağ AI rail; büyük grafik şeridi yok | `docs/product/DASHBOARD_COMMAND_CENTER_REDESIGN.md` |
| Onaylar: tam AI kolon değil; bağlama özel **read-only** dar panel | `docs/product/APPROVAL_INBOX_PRODUCT_SPEC.md` |
| AI UI’da yasak CTA: “Uygula”, “Otomatik kaydet” (mutation ima eden) | `docs/product/UI_SCOPE_GUARD.md` |

---

## 4. Hızlı İşlem — iş akışı ve UI

| Karar | Kaynak |
|--------|--------|
| **Ana operasyon / yeni fiş merkezi**; klasik tablo hissi, arka planda workflow | `docs/product/quick-operation-center.md` |
| Route: `/hizli-islem` | `docs/product/quick-operation-center.md` |
| İşlem türleri: `offer`, `sale_order`, `delivery`, `payment`, `return` | `docs/product/quick-operation-center.md` |
| UI: tür seçimi, cari, satır tablosu, kaynak akordiyonu, toplamlar, operasyon etkisi paneli | `docs/product/quick-operation-center.md` |
| Kaynaklar: `center_warehouse`, `factory`, `supplier`, `split`, `auto` → farklı workflow etkileri | `docs/product/quick-operation-center.md` |
| `offer`: teklif; stok rezervi yok; belge/WA taslak | `docs/product/quick-operation-center.md` |
| `sale_order`: sipariş + source plan + depo/fabrika/tedarik etkileri | `docs/product/quick-operation-center.md` |
| Sağ panel sırası: **1) Cari Özeti 2) İşlem Özeti 3) Uyarı/Onay** | `docs/DECISIONS.md` |
| Üst ve alt **çift aksiyon bandı yok** | `docs/DECISIONS.md` |
| Riskli işlemler doğrudan uygulanmaz → **approval ticket** | `crm-backlog.md` |
| Ana yüzey: **Hızlı Satış Masası** (`hizli-islem-satis-masasi-acik-mod.png`) | `docs/product/UI_DESIGN_LANGUAGE_EMERALD_GOLD.md` |
| `/teklifler/yeni`, `/siparisler/yeni` → hub; gerçek form değil, Hızlı İşlem’e yönlendirme | `docs/product/UI_SCOPE_GUARD.md` |
| `/tahsilatlar/yeni` → gerçek tahsilat formu (`PaymentCreatePage`) ayrı tutulabilir | `docs/product/QUICK_OPERATION_SALES_PAYMENT_REWORK.md` |
| Sipariş + ödeme submit; approval payload ödeme taşır | `docs/product/QUICK_OPERATION_SALES_PAYMENT_REWORK.md` |

---

## 5. Liste sayfaları — yoğunluk, panel, aksiyon

| Karar | Kaynak |
|--------|--------|
| Kompakt liste; backlog hedefi ≥20 satır; **kabul kuralı** 1920×1080’de kaydırmadan **≥5 satır** | `crm-backlog.md`, `.cursor/rules/ui-designer-rules.mdc` |
| Üst KPI/filtre/chip/preview listeyi **ezmemeli** | `.cursor/rules/ui-designer-rules.mdc` |
| Liste sayfalarında büyük grafik yok veya **mini strip** | `.cursor/rules/ui-designer-rules.mdc` |
| **AKSİYON kolonu** satır sonunda; sağ panel hızlı aksiyonların **yerine geçmez** | `.cursor/rules/ui-designer-rules.mdc` |
| Sağ panel veri varken **boş açılmaz**; ilk satır seçili | `.cursor/rules/ui-designer-rules.mdc` |
| Filtre butonları kesilmez; sığmazsa **34×34 icon-only** + title/aria-label | `.cursor/rules/ui-designer-rules.mdc` |
| Satır tıklama → detay modal (backlog genel pattern) | `crm-backlog.md` |
| Modal: başlık, cari/belge, satırlar, toplamlar, alt aksiyonlar (Düzenle, Sil, Onayla, …) | `.cursor/rules/ui-rules.mdc` |
| Mutation butonları: toast + **disabled-after-success**; demo’da sahte başarı yok | `crm-backlog.md`, `AGENTS.md` |
| Demo veri ayrı dosya; ince demo band **18–24px** | `.cursor/rules/ui-designer-rules.mdc` |
| Şablon **A**: KPI, filtre, demo band, liste + sağ bağlam 320–350px | `docs/development/UI_MASTER_DESIGN_BACKLOG.md` |

---

## 6. Entity detay ve katman sekmeleri (Sprint 3)

| Karar | Kaynak |
|--------|--------|
| **Detay kök** (`/cariler/[id]`, `/siparisler/[id]`): entity header + `EntityLayerNav`, orta alan masa | `docs/design/ENTITY_LAYER_REFERENCE.md` |
| **Katman** (`/cariler/[id]/finans`, …): aynı kabuk; yalnızca gövde + sağ **Bağlam** değişir | `docs/design/ENTITY_LAYER_REFERENCE.md` |
| Cari sekmeleri: Detay, Özet, İletişim, Finans, Teklifler, Siparişler, Tahsilatlar, Timeline | `docs/design/ENTITY_LAYER_REFERENCE.md` |
| Sipariş sekmeleri: Detay, Özet, Satırlar, Ödeme, Teslimat, Fatura, İade, Depo, Timeline | `docs/design/ENTITY_LAYER_REFERENCE.md` |
| Teklif sekmeleri: Özet, Satırlar, Müşteri, Dönüşüm, Belgeler, Timeline | `docs/development/UI_REFERENCE_PAGE_GUIDES.md` |
| Hedef şablon **B** (kök detay) + **C** (katman masası); kodda çoğu yerde henüz READINESS | `docs/development/UI_MASTER_DESIGN_BACKLOG.md` |

---

## 7. Modül özel UI kararları

| Karar | Kaynak |
|--------|--------|
| **Onaylar:** operasyon masası; kart vitrini değil; 3 kolon desk | `docs/DECISIONS.md`, `docs/product/APPROVALS_COMMAND_DESK_REDESIGN.md` |
| **Stok:** detay yalnızca **Detay** butonundan; satır tıklama seçim/sağ panel | `docs/DECISIONS.md` |
| **Depo:** modül adı **Depo Hazırlık**; akış Hazırlık → Ürün Teslimi → Arşiv/PDF; fişte yazdır | `docs/DECISIONS.md` |
| **WhatsApp:** sade konuşma listesi; yeşil + nötr renk | `docs/DECISIONS.md` |
| **Ayarlar:** temiz form/sekme; kural dili: Evet/Hayır/Koşullu/Onay gerekir/Otomatik kapalı | `docs/DECISIONS.md` |
| **Operatör workspace:** ayrı menü değil; mevcut modüllerin birleşik modeli; mutation yok | `docs/product/OPERATOR_WORKSPACE_PRODUCT_SPEC.md` |

---

## 8. Referans görsel ve kod süreci

| Karar | Kaynak |
|--------|--------|
| Onaylı PNG = **tasarım hedefi**; layout/kolon/sağ panel **bire bir** | `.cursor/rules/10-reference-design-fidelity.mdc` |
| **PNG onayı olmadan BIREBIR kod başlamaz** | `docs/development/UI_DESIGN_TEAM_WORKFLOW.md` |
| Süreç: AI üretir → kullanıcı onaylar → ajan bire bir kodlar → kontrol | `docs/development/UI_DESIGN_TEAM_WORKFLOW.md` |
| Kod durumları: BIREBIR, KISMI, ZEMIN, READINESS, LEGACY | `docs/development/UI_MASTER_DESIGN_BACKLOG.md` |
| Sprint 1 ✅ BIREBIR: stok, arşiv, raporlar, whatsapp (4 PNG) | `docs/development/UI_MASTER_DESIGN_BACKLOG.md` |
| 76 katalog PNG üretildi → **TASLAK** toplu onay bekliyor | `docs/development/UI_REFERENCE_CATALOG.md` |
| Restore zemin `#fdfcf9` tek başına “tasarım tamam” sayılmaz | `docs/development/UI_DESIGN_TEAM_WORKFLOW.md` |
| Sayfa rehberi (senaryolar): `UI_REFERENCE_PAGE_GUIDES.md` | `docs/development/UI_REFERENCE_PAGE_GUIDES.md` |

---

## 9. Yapay zeka — yapabilir / yapamaz

### Yapabilir
| Karar | Kaynak |
|--------|--------|
| Read-only analiz, özet, yorum, risk notu | `docs/DECISIONS.md`, `.cursor/rules/03-ai-approval-policy.mdc` |
| Proposal / taslak üretimi | `docs/ai-proposal-flow.md` |
| Onay bileti (`waiting_approval`) oluşturma | `.cursor/rules/03-ai-approval-policy.mdc` |
| Bilgi sorusu → doğrudan yanıt (read-only) | `docs/local-first-ai-decision.md` |
| Operator mod: mutation **niyeti** → proposal; execution yapmaz | `docs/ai-operator-mode.md` |

### Yapamaz
| Karar | Kaynak |
|--------|--------|
| **Doğrudan CRM verisi değiştirmez** | `docs/DECISIONS.md`, `AGENTS.md`, `.cursor/rules/safety-rules.mdc` |
| Approval bypass yok | `.cursor/rules/03-ai-approval-policy.mdc` |
| Tenant / permission bypass yok | `.cursor/rules/03-ai-approval-policy.mdc` |
| Fallback provider **mutation execute etmez** | `docs/local-first-ai-decision.md` |
| Otonom AI execution bu fazda yok | `docs/policy-engine-foundation.md` |
| UI’da doğrudan “Uygula” ile kritik write yok | `docs/product/UI_SCOPE_GUARD.md` |

### İnsan onayı zorunlu (örnekler)
| Karar | Kaynak |
|--------|--------|
| Fiyat/iskonto değişimi | `.cursor/rules/03-ai-approval-policy.mdc` |
| Sipariş kesinleştirme, tahsilat, fatura, iade | `.cursor/rules/03-ai-approval-policy.mdc` |
| Stok düşme, depo çıkışı | `.cursor/rules/03-ai-approval-policy.mdc` |
| ERP write, fabrika siparişi | `.cursor/rules/03-ai-approval-policy.mdc` |
| Teslim tamamlama | `.cursor/rules/03-ai-approval-policy.mdc` |
| Yüksek riskli WhatsApp / belge gönderimi | `.cursor/rules/03-ai-approval-policy.mdc` |
| Finansal belgeler, ödeme linkleri, ekstreler | `docs/DECISIONS.md` |
| `ai_plan_approval` | `.cursor/rules/safety-rules.mdc` |

### Local-first AI stratejisi
| Karar | Kaynak |
|--------|--------|
| Varsayılan **local-first** (kurum içi veri güvenliği) | `docs/local-first-ai-decision.md`, `docs/master-project-spec.md` |
| Harici LLM (OpenAI vb.) **opsiyonel katman**; birincil mod değil | `docs/local-first-ai-decision.md` |
| Runtime önceliği: Local → External → **Safe fallback** | `docs/local-first-ai-decision.md` |
| CRM + WhatsApp + Ses: bilgi → yanıt; işlem → proposal → onay → execution | `docs/local-first-ai-decision.md` |
| Web: `/ai`, `/ai/onaylar`, `/ai/icgoruler` — proposal snapshot, read-only inceleme | `docs/ai-operator-mode.md` |

### AI proposal API (hedef sözleşme)
| Karar | Kaynak |
|--------|--------|
| `POST/GET /ai/proposals`, confirm, reject | `docs/ai-proposal-flow.md` |
| Mutation proposal → `requiresApproval` / `waiting_approval` | `docs/ai-proposal-flow.md` |
| Onaysız execution dispatch **yok** | `docs/ai-proposal-flow.md` |

---

## 10. Onay, policy ve execution zinciri

| Karar | Kaynak |
|--------|--------|
| Zincir: **permission → policy → approval → transaction → audit/timeline → outbox** | `.cursor/rules/00-project-context.mdc`, `docs/approval-execution-flow.md` |
| Onay sonrası yalnızca **execution dispatcher** domain handler çağırır | `docs/architecture/APPROVAL_POLICY_ENGINE.md` |
| UI onay gerektiren işlemler backend bağlı değilse **yalnızca taslak/demo** | `.cursor/rules/safety-rules.mdc` |
| Gerçek execution = ayrı görev + backend planı | `.cursor/rules/safety-rules.mdc` |

### Dispatch edilen aksiyonlar (hedef)
`create_offer`, `create_order`, `create_payment`, `mark_warehouse_ready`, `complete_delivery`, `create_invoice`, `create_return`, `send_document_whatsapp`, `queue_document_save`, `queue_document_print`, `update_order_status` — `docs/approval-execution-flow.md`

### Policy engine
| Karar | Kaynak |
|--------|--------|
| Permission geçse bile policy **require_approval** / **deny** uygulanabilir | `docs/architecture/APPROVAL_POLICY_ENGINE.md` |
| `deny` = fail-closed; success gibi davranmaz | `docs/policy-engine-foundation.md` |
| AI kaynaklı kritik execute: `dry_run_only` veya `require_approval` | `docs/policy-engine-foundation.md` |
| Süresi dolmuş onay, yetkisiz onaylayıcı → execution yok | `docs/architecture/APPROVAL_POLICY_ENGINE.md` |

### Transactional bridge + outbox
| Karar | Kaynak |
|--------|--------|
| Approve: dispatch + audit + timeline + **outbox enqueue** tek transaction | `docs/approval-execution-flow.md`, `docs/audit-timeline-model.md` |
| Bridge hata → onay `approved` **yapılmaz** (fail-closed) | `docs/approval-execution-flow.md` |
| Duplicate approve → ikinci outbox **yok** (idempotency) | `docs/durable-workflow-outbox-hardening.md` |
| Worker: claim lease, retry, DLQ; production’da silent in-memory fallback **kapalı** | `docs/architecture/WORKER_OUTBOX_RETRY_DLQ.md` |
| Çoğu fazda handler **dry_run**; gerçek ERP/mutation kontrollü gate ile | `docs/audit-timeline-model.md`, `docs/production-real-product-cutover.md` |

---

## 11. Tenant, auth, permission

| Karar | Kaynak |
|--------|--------|
| Her API/worker/domain **tenant context** zorunlu | `.cursor/rules/02-tenant-auth-permission.mdc` |
| `tenantId` istemciden **güvenilmez**; session/principal | `.cursor/rules/02-tenant-auth-permission.mdc` |
| **Permission guard olmadan mutation yok** | `.cursor/rules/02-tenant-auth-permission.mdc` |
| Cross-tenant endpoint / join **yasak** | `.cursor/rules/01-architecture-guardrails.mdc` |
| `x-tenant-id` ≠ session → `tenant_mismatch` **403** | `docs/auth-and-tenant-flow.md` |
| Production: demo auth, mock token, header principal fallback **açılamaz** | `.cursor/rules/02-tenant-auth-permission.mdc` |
| Pasif kullanıcı / yetkisiz rol → 401/403; DB hatasında silent success **yok** | `.cursor/rules/02-tenant-auth-permission.mdc` |

---

## 12. Mimari katmanlar ve yasaklar

| Katman | Rol | Kaynak |
|--------|-----|--------|
| `apps/web` | UI only; mutation yok | `.cursor/rules/01-architecture-guardrails.mdc` |
| `apps/api` | HTTP, auth/tenant, orchestration, audit yazımı | `.cursor/rules/01-architecture-guardrails.mdc` |
| `apps/worker` | Queue; API ile **aynı policy** | `.cursor/rules/01-architecture-guardrails.mdc` |
| `packages/domain` | İş kuralları, registry, policy | `.cursor/rules/01-architecture-guardrails.mdc` |
| `packages/database` | Şema/migration; iş kuralı **yok** | `.cursor/rules/01-architecture-guardrails.mdc` |

### Yasaklar
- UI → doğrudan DB / ERP / WhatsApp write  
- Route içinde domain atlayan yeni iş mantığı  
- Onaysız finansal/ticari write  
- Production’da sessiz mock ile mutation başarısı simülasyonu  
— `.cursor/rules/01-architecture-guardrails.mdc`

### Mutation tek giriş
Guard’lı API/worker → domain servisi → transaction → `recordAuditEvent` / timeline — `.cursor/rules/05-domain-service-rules.mdc`

---

## 13. Audit ve timeline

| Karar | Kaynak |
|--------|--------|
| Merkezi `recordAuditEvent`; actor: user \| system \| ai \| whatsapp | `docs/audit-timeline-model.md` |
| Olay tipleri: cari, teklif, sipariş, tahsilat, depo, teslimat, fatura, iade, onay, AI, belge, … | `docs/audit-timeline-model.md` |
| Okuma: `GET /audit-events`, `GET /entity-timelines/:type/:id` | `docs/audit-timeline-model.md` |
| Execution write-back + DB migration aşamalı | `docs/audit-timeline-model.md` |

---

## 14. WhatsApp ve omnichannel

| Karar | Kaynak |
|--------|--------|
| Hybrid: **kural + AI + fallback** | `docs/master-project-spec.md`, `docs/local-first-ai-decision.md` |
| Üç kanal mantığı: müşteri / personel / yönetici (farklı policy) | `docs/master-project-spec.md` |
| Webhook: secret yoksa verify **true dönmez** (prod fail-closed) | `.cursor/rules/04-whatsapp-omnichannel-security.mdc` |
| Duplicate guard, expiry, token **hash** (raw token saklanmaz) | `.cursor/rules/04-whatsapp-omnichannel-security.mdc` |
| Komut onayı: `ONAY`/`RED`/`INCELE` + ref + token; yetkili telefon | `.cursor/rules/04-whatsapp-omnichannel-security.mdc` |
| Outbound/mutation: **kanal policy + permission** zorunlu | `.cursor/rules/04-whatsapp-omnichannel-security.mdc` |
| Omnichannel reply: **approval-first**; direct live send açılmaz (faz notu) | `docs/approval-execution-flow.md` |
| AI taslak üretir; gönderim policy + onay + outbox | `crm-backlog.md` |

---

## 15. ERP, fabrika, belge, yerel çıktı (planlanan entegrasyon)

| Alan | Plan | Kaynak |
|------|------|--------|
| **ERP** | Cari, ürün, stok, sipariş, fatura senkron; adapter + mapping + sync log | `docs/master-project-spec.md`, `docs/module-map.md` |
| **Fabrika** | Anlık stok, sipariş iletimi, durum geri bildirimi; `/fabrikalar/stoklar`, `/fabrikalar/siparisler` | `docs/master-project-spec.md` |
| **Belgeler** | Yükleme, arşiv, WA/e-posta (onaylı) | `docs/module-map.md` |
| **Local agent** | Yazdır/kaydet; insan onaylı; placeholder success **yok** | `docs/production-hardening-foundation.md` |
| Feature registry: `premium.erp`, `premium.factory`, `premium.whatsapp` + metering | `docs/architecture/FEATURE_REGISTRY_MODEL.md` |
| Hızlı İşlem `factory` kaynağı → factory workflow impact | `docs/product/quick-operation-center.md` |

---

## 16. Bilinçli ertelenen / henüz açılmayan (doküman durumu)

| Konu | Durum | Kaynak |
|------|--------|--------|
| ERP/fabrika **canlı write** | Cutover fazında kapalı | `docs/production-real-product-cutover.md` |
| WhatsApp **canlı outbound** (2B) | Planlı; web fake send yok | `docs/development/DOCUMENTS_WHATSAPP_DELIVERY_PHASE_2_REPORT.md` |
| Omnichannel IG/FB/Email/SMS live | Kapsam dışı | `docs/production-real-product-cutover.md` |
| Worker production daemon / tam mutation handlers | Sonraki faz | `docs/approval-execution-flow.md` |
| Temporal/Cadence | Yapılmayacak (outbox tercih) | `docs/durable-workflow-outbox-hardening.md` |
| Tam WhatsApp workflow store / Web.js prod gateway | Port devam | `docs/implementation/006-whatsapp-security-rules-port.md` |
| Entity katman UI (çoğu route) | READINESS → hedef B/C | `docs/development/UI_MASTER_DESIGN_BACKLOG.md` |
| `crm-ui-blueprint.md` | Repoda **yok** (yalnız referans) | `crm-backlog.md` notu |

---

## 17. Geliştirme süreci ve kalite kapıları

| Karar | Kaynak |
|--------|--------|
| Branch: `feature|fix|refactor|docs|hardening|test/<scope>-<name>` | `docs/development/BRANCH_AND_PR_STANDARD.md` |
| Commit prefix: `feat:`, `fix:`, `hardening:`, … | `.cursor/rules/09-pr-review-checklist.mdc` |
| PR öncesi: typecheck, lint, test, `smoke:navigation` | `docs/development/QUALITY_GATES.md` |
| UI işi sonu: web + ui typecheck, smoke:navigation | `.cursor/rules/ui-designer-rules.mdc` |
| `tsconfig.tsbuildinfo` **commit’e alınmaz** | `docs/development/QUALITY_GATES.md` |
| Tenant/approval/webhook/AI guard değişikliği → **test zorunlu** | `docs/development/CODEX_TASK_STANDARD.md` |
| Codex görevleri: 9 başlık şablon (amaç, dokunulacaklar, kabul, geri alma) | `docs/development/CODEX_TASK_STANDARD.md` |
| UI agent: komut çalıştırmadan önce kullanıcıya bildir (`AGENTS.md`) | `AGENTS.md` |

---

## 18. İlgili ana belgeler (indeks)

| Konu | Dosya |
|------|--------|
| Ürün kararları (kısa) | `docs/DECISIONS.md` |
| Ekran backlog | `crm-backlog.md` |
| Master spec | `docs/master-project-spec.md` |
| AI akışı | `docs/ai-proposal-flow.md`, `docs/local-first-ai-decision.md`, `docs/ai-operator-mode.md` |
| Onay execution | `docs/approval-execution-flow.md`, `docs/architecture/APPROVAL_POLICY_ENGINE.md` |
| Policy | `docs/policy-engine-foundation.md` |
| Audit | `docs/audit-timeline-model.md` |
| Auth/tenant | `docs/auth-and-tenant-flow.md` |
| Mimari | `docs/architecture.md`, `docs/module-map.md` |
| Hızlı İşlem | `docs/product/quick-operation-center.md` |
| UI sprint/backlog | `docs/development/UI_MASTER_DESIGN_BACKLOG.md` |
| Referans PNG katalog | `docs/development/UI_REFERENCE_CATALOG.md` |
| Sayfa senaryoları | `docs/development/UI_REFERENCE_PAGE_GUIDES.md` |
| Cursor kuralları | `.cursor/rules/00–10*.mdc`, `AGENTS.md` |
| Production faz kuyruğu | `docs/development/PRODUCTION_EXECUTION_QUEUE.md` |

---

*Son güncelleme: ajan ekibi envanter taraması — konuşma/planlama için derlenmiştir.*
