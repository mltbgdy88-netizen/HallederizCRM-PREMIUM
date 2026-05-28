# HallederizCRM-PREMIUM — Proje Tanıtımı

Bu belge, repodaki resmi ürün ve mimari dokümanlardan derlenmiş **tek parça tanıtım metnidir**. Bağlayıcı teknik detaylar için kaynak dosyalara bakınız (son bölüm).

---

## 1. Bu proje nedir?

**HallederizCRM-PREMIUM**, duvar kağıdı sektörüne odaklanmış, **çok kiracılı (multi-tenant)** bir **kurumsal CRM ve operasyon platformudur**. Yalnızca müşteri kaydı tutan bir CRM değil; **tekliften tahsilata**, **depodan teslimata**, **iletişimden belgeye** kadar ticari ve operasyonel zinciri **tek sistemde orkestre etmek** için tasarlanmıştır.

Platform şu yetenekleri bir arada sunar:

- Çekirdek CRM (cari, ilişki, ticari geçmiş)
- Ürün / stok / depo operasyonları
- Ticari akış (teklif, sipariş, tahsilat, fatura, iade, teslimat)
- Operasyon motoru (görev, workflow, uyarı, onay)
- **WhatsApp** ve omnichannel iletişim otomasyonu
- **ERP** ve **fabrika** entegrasyonları
- **İnsan onaylı, local-first yapay zeka** (öneri ve taslak; kontrolsüz otomasyon değil)
- Belge üretimi, dağıtım ve arşiv
- İç personel için **masaüstü hissi veren web cockpit**

Kanonik veri kaynağı **PostgreSQL**’dir. Ana web uygulama, şirket içi personelin günlük operasyon merkezi olarak çalışır.

---

## 2. Neden kuruldu? Hangi sorunu çözer?

Sektörde ticari süreçler çoğu zaman dağınık kanallarda yürür: telefon ve WhatsApp talepleri, Excel veya eski ERP kayıtları, depo/fabrika stok bilgisi, onay bekleyen fiyat ve siparişler, belge paylaşımı. HallederizCRM-PREMIUM bu parçaları **denetlenebilir, izlenebilir ve onaylı** tek platformda toplamak için kurulmuştur.

**Temel iş hedefleri:**

| Hedef | Açıklama |
|--------|-----------|
| Operasyonel bütünlük | Teklif → sipariş → depo → teslimat → tahsilat → fatura → iade zincirinin tek kayıt modelinde izlenmesi |
| Hız + kontrol | Personelin hızlı işlem yapması; kritik adımlarda insan onayı ve audit izinin korunması |
| Kanal birleşimi | Müşteri iletişiminin (özellikle WhatsApp) CRM ve iş akışlarına bağlanması |
| Entegrasyon | ERP ve fabrika verisinin çekirdek domain’e adapter ile bağlanması; çekirdeğin entegrasyon teknolojisine kilitlenmemesi |
| Kurumsal güven | Çok kiracılı izolasyon, rol/izin, local-first AI, fail-closed güvenlik |
| Masaüstü deneyim | Web tabanlı ama ERP benzeri sabit shell, kompakt listeler, operasyon masaları |

Ürün dili **sakin, premium, kurumsal ve operasyon odaklıdır**; demo dashboard veya aşırı KPI vitrini hedeflenmez (`docs/DECISIONS.md`).

---

## 3. Vizyon ve stratejik hedefler

### 3.1 Ürün vizyonu

Platformun amacı, şirket içi ekiplerin **aynı operasyon modeli** üzerinde çalışmasıdır:

- Ön yüz: sade, tutarlı, hızlı
- Arka plan: güçlü iş motoru, kuyruklar, entegrasyonlar
- Otomasyon: **kural → kural+AI öneri → AI proposal + insan onayı + kontrollü icra** kademeleri
- AI: karar destek ve hızlandırma; **kontrolsüz otonom mutation değil**

### 3.2 Ölçülebilir fayda hedefleri (AI ve operasyon)

- Personelin karar kalitesini artırmak
- Operasyon hızını yükseltmek
- Kurumsal denetlenebilirlikten ödün vermemek
- Her kritik adımın workflow step, görev veya onay kaydı olarak izlenebilir olması

### 3.3 Paketleme hedefi (multi-tenant)

Tenant bazlı modül aç/kapa ile lisanslama düşünülür:

1. **Core** — platform + temel CRM  
2. **Operations** — sipariş, depo, teslimat, belgeler  
3. **Automation** — WhatsApp, workflow, görev motoru  
4. **Intelligence** — AI proposal ve onaylı aksiyon akışları  

---

## 4. Bu proje ne değildir? (Kapsam sınırı)

Aşağıdakiler **bilinçli olarak bu repo kapsamı dışında** veya stratejik olarak sonraya bırakılmıştır:

- Dış **bayi / müşteri web portalı** (ayrı login); dış bilgi akışı ağırlıklı **WhatsApp ve belge** üzerinden
- Kontrolsüz otomasyon veya tenant’sız “global admin” kısayolları
- AI’nın doğrudan finansal/ticari veriyi onaysız değiştirmesi
- İleri BI ürünleştirme, marka özel ekranlar, gelişmiş mobil offline (roadmap’te sonraki fazlar)

---

## 5. Değişmez ilkeler

Bu ilkeler tüm teknik ve ürün kararlarında **bağlayıcıdır**:

1. **Kanonik veri:** PostgreSQL  
2. **Multi-tenant:** Mimari baştan tenant odaklı; tenant dışı veri erişimi yasak  
3. **AI varsayılan read-only:** Mutation yalnızca insan onayı + policy + execution zinciri ile  
4. **Mutation zinciri:** `permission guard → policy/approval → transaction → audit/timeline → outbox`  
5. **WhatsApp:** Hybrid workflow — **kural + AI + fallback**  
6. **Local-first AI:** Kurum içi veri güvenliği ve denetlenebilirlik; harici LLM opsiyonel adapter  
7. **Fail-closed:** Production’da eksik secret/config ile sessiz başarı yok  
8. **Dashboard ≠ KPI şovu:** Sonraki iş ve yön; **Hızlı İşlem** ana operasyon yüzeyi  

---

## 6. Ana modüller ve ticari zincir

### 6.1 Modül aileleri

| Aile | İçerik |
|------|--------|
| Platform Core | Auth, RBAC, tenant, ayarlar, tema |
| Çekirdek CRM | Cari, iletişim, adres, hesap, fiyat profili |
| Ürün ve Stok | Varyant, barkod/QR, depo stok, hareket |
| Ticari Akış | Teklif, sipariş, tahsilat, depo emri, teslimat, fatura, iade |
| Operasyon Motoru | Workflow, görev, uyarı, onay |
| Entegrasyon | ERP, fabrika, WhatsApp, belge dağıtımı |
| Yapay Zeka | Proposal, onay kaydı, server-side execution, içgörü |

### 6.2 Tipik ticari yol

```text
Cari → Teklif → Sipariş → Depo emri / Fabrika → Teslimat → Fatura → Tahsilat
                              ↘ İade / Belge / WhatsApp bildirimi
```

Her belge ve dağıtım eylemi domain kaydına bağlı üretilir; audit ve timeline üzerinden geriye dönük izlenir.

---

## 7. Kullanıcı deneyimi ve operasyon yüzeyleri

### 7.1 App shell

- Sol menü (masaüstünde sabit), üst bar (bağlam, arama, kullanıcı), modül içerik alanı  
- Light/dark tema; modüller arası tutarlı geçiş  
- Hedef: ERP benzeri **iç personel cockpit**

### 7.2 Gösterge paneli (Dashboard)

Dashboard **pasif rapor sayfası değil**, **aksiyon merkezidir**: onay bekleyenler, geciken görevler, senkronizasyon uyarıları, AI öneri kuyruğu. Kart → modal → ilgili kayıt / modül sayfası.

**AI asistan kolonu** yalnızca ana gösterge panelinde yer alır; diğer sayfalarda ayrı AI chat kolonu hedeflenmez (ayarlar altında AI yapılandırması).

### 7.3 Hızlı İşlem Merkezi

**Ana operasyon ekranıdır.** Kullanıcı basit bir tablo/fiş hissiyle veri girer; sistem arka planda teklif, sipariş, teslimat, tahsilat, iade ve ilgili depo/fabrika/belge/WhatsApp etkilerini üretir.

İşlem türleri: teklif, sipariş, teslimat, tahsilat, iade. Kaynak seçimi (merkez depo, fabrika, tedarikçi, bölünmüş, otomatik) operasyon workflow’larını tetikler.

### 7.4 Onaylar

Riskli operasyonlar, AI planları ve kritik mutation’lar **onay masası / komut masası** üzerinden yürür; kart vitrini değil operasyon desk deneyimi hedeflenir.

### 7.5 WhatsApp

Müşteri mesajları, hazır cevap, AI **taslak**; konuşmadan sipariş/teklif/tahsilat başlatma. AI **doğrudan göndermez**; policy + onay + outbox.

Kanal rolleri: müşteri bilgi akışı, personel görev bildirimi, yönetici onay/komut (`ONAY` / `RED` / `İNCELE`).

---

## 8. Yapay zeka yaklaşımı

**Resmi yön:** local-first / açık kaynak / kurum içi. OpenAI vb. birincil hedef değil, opsiyonel provider katmanıdır.

**Ortak davranış modeli** (CRM + WhatsApp + ses):

1. Bilgi sorusu → doğrudan yanıt  
2. İşlem talebi → proposal  
3. Özet + risk notları  
4. Approval isteği  
5. Onay sonrası execution  

Onay gerektiren örnekler: teklif/sipariş oluşturma, tahsilat, fatura, iade, depo hazırlık, teslim tamamlama, belge WhatsApp gönderimi, yüksek riskli kanal mesajları.

---

## 9. Teknoloji ve mimari özet

| Katman | Teknoloji / konum |
|--------|-------------------|
| Monorepo | `pnpm` workspace + `turbo` |
| Dil | TypeScript |
| Web | Next.js (`apps/web`) |
| API | Fastify (`apps/api`) |
| Worker | Kuyruk, senkronizasyon, arka plan işleri |
| AI | `apps/ai-service`, `apps/local-ai-service`, local agent |
| Domain | `packages/domain` — iş kuralları, policy |
| Veri | `packages/database` — PostgreSQL |
| UI | `packages/ui` — ortak tasarım dili |

İstek zinciri (özet): web → API (yetki/policy) → domain → PostgreSQL → worker / entegrasyon / AI → audit & timeline.

---

## 10. Yol haritası (faz özeti)

Resmi delivery planı fazlara bölünmüştür (`docs/roadmap.md`):

| Faz | Odak |
|-----|------|
| 0 | Ürün kapsamı, modül sınırları, bilgi mimarisi, tasarım sistemi |
| 1 | Platform core (auth, RBAC, tenant, app shell) |
| 2 | Ürün / stok / fiyatlandırma |
| 3 | Cariler / teklifler / siparişler |
| 4+ | Tahsilat, depo, teslimat, fatura, iade, entegrasyonlar, AI, belgeler, raporlar |

Her faz bir sonrakine veri modeli, davranış ve deneyim altyapısı taşır.

---

## 11. Mevcut repo durumu (kısa not)

Kök `README.md` projeyi **temiz monorepo bootstrap iskeleti** olarak tanımlar; iş mantığı bilinçli olarak aşamalı eklenir. UI tarafında premium operasyon masaları ve referans görsellerle hizalama devam eder; bağlayıcı ürün tanımı **`docs/master-project-spec.md`** ile uyumlu kalmalıdır.

---

## 12. Kaynak dokümanlar (derleme bibliyografyası)

| Konu | Dosya |
|------|--------|
| Resmi ürün spesifikasyonu | `docs/master-project-spec.md` |
| Ürün kararları (UI/AI/WA) | `docs/DECISIONS.md` |
| Mimari çerçeve | `docs/architecture.md` |
| Modül ve menü haritası | `docs/module-map.md` |
| Faz planı | `docs/roadmap.md` |
| Hızlı İşlem | `docs/product/quick-operation-center.md` |
| Kök özet | `README.md` |
| Dokümantasyon indeksi | `docs/README.md` |
| Agent / değişmez ilkeler | `.cursor/rules/00-project-context.mdc`, `AGENTS.md` |
| AI stratejisi | `docs/local-first-ai-decision.md` |
| Karar envanteri | `docs/development/PROJECT_DECISIONS_INVENTORY.md` |
| WhatsApp + AI kuralları | `docs/development/WHATSAPP_AI_WORKFLOW_DECISIONS.md` |

---

*Son güncelleme: repodaki master spec, architecture, roadmap, DECISIONS ve README metinlerinden derlenmiştir.*
