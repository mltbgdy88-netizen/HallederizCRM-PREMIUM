# Operasyon Otomasyonu — Hedef Model ve Uygulama Sırası

**Amaç:** Tüm dağınık planlardan (vol2 hızlı satış, PREMIUM spec, pilot, WA matrisi, crm5) çıkan **tek omurga**; mevcut kodla gap analizi; SaaS (~500 kullanıcı) için altyapı guardrail’leri.

**İlgili:** [`NAVIGATION_IA.md`](./NAVIGATION_IA.md), [`DECISIONS.md`](./DECISIONS.md), [`master-project-spec.md`](./master-project-spec.md)

---

## 1. Neden bu proje var?

> Basit görünen vitrin; arkada hiçbir ticari adımın unutulmadığı, onaylı ve denetlenebilir operasyon platformu.

Duvar kağıdı / B2B ticaret için kritik:
- Merkez stok yok → **fabrika/tedarik** süreci otomatik açılır.
- WhatsApp’tan gelen talep → **bilgi** veya **proposal + onay**; sessiz mutation yok.
- Mağaza personeli **fiş mantığı** görür; motor depo, fabrika, tahsilat, teslim, fatura dağıtır.

---

## 2. Hedef omurga (Commercial Spine)

```
Giriş (Hızlı İşlem / WhatsApp / Teklif-Sipariş listesi)
  → Kayıt (Teklif | Satış — ayrı entity, bağlı geçmiş)
  → Kaynak planı (merkez | fabrika | tedarik | split | auto)
  → Policy + Onay
  → Execution (domain servis, transaction, audit, outbox)
  → Paralel: Depo Hazırlık | Fabrika emri | Tahsilat | Teslim | Fatura | Belge | WA (onaylı)
  → Timeline + Görev + Arşiv
```

### Otomasyon seviyeleri

| Seviye | Davranış |
|--------|----------|
| L1 Kural | Tetikleyici → görev / uyarı kartı |
| L2 Kural + AI | Özet, taslak, risk notu |
| L3 Proposal | İnsan onay → dispatcher → icra |

### Kanal kuralları (değişmez)

- **Hızlı İşlem:** Teklif arşive; satış workflow impact üretir.
- **WhatsApp:** Intent matrisi (`WHATSAPP_AI_WORKFLOW_DECISIONS.md`); fiyat/sipariş/ödeme otomatik icra yok.
- **Fabrika (kullanıcı modülü):** Üretim/sevkiyat takibi; API/kuyruk **Ayarlar → Entegrasyon**.

---

## 3. Domain workflow adımları (mevcut kod)

`packages/domain/src/workflows/index.ts` — sipariş zinciri:

1. Sipariş onayı  
2. Kaynak planı  
3. Depo hazırlık  
4. **Fabrika takip**  
5. Tahsilat kontrolü  
6. Teslim  
7. Fatura ve belge  

Bu model hedef UI ile uyumludur; **tetikleyici giriş noktası** bağlanmalıdır.

---

## 4. Mevcut durum — gap matrisi

| Hedef | Kod / UI durumu | Gap |
|-------|-----------------|-----|
| Hızlı İşlem → motor | `/hizli-islem` = `HizliSatisMasasiPage` (mock) | `QuickOperationPage` + `submitQuickOperationRecord` route’sız |
| Teklif / Satış ikili (vol2) | Mock fiş | İşlevsel ayrım yok |
| Dashboard sıradaki iş | Final gösterge + KPI overlay | Operations engine kartları bağlı değil |
| Fabrika zinciri | Ekranlar + domain step | Satıştan otomatik emir UI kopuk |
| Onay + policy | Registry güçlü | UI referans; uçtan uca smoke sınırlı |
| WA hibrit | Domain kuralları | Canlı kanal cutover ayrı faz |
| Menü sade IA | 19 kalem sidebar | → [`NAVIGATION_IA.md`](./NAVIGATION_IA.md) uygulanıyor |
| İş akışları admin | Inventory `/is-akislari/*` | Ayarlar altında kural editörü (gelecek) |

**Özet:** Altyapı ~%55; günlük otomasyon zinciri ~%30 canlı.

---

## 5. Uygulama sırası (P0–P3)

### P0 — Omurga (patlamayı önleyen)

1. `/hizli-islem` → `QuickOperationPage` + `submitQuickOperationRecord` (Final fiş UI korunarak veya kademeli)
2. Satış onayı sonrası: depo emri + fabrika emri + görev üretimi (domain servis, tek transaction sınırı)
3. Idempotency + approval dispatcher — mevcut; **UI’dan bypass yok**

### P1 — Görünürlük

4. Dashboard: operations-engine kartları (Fabrikadan gelecekler, Depo, Onay…)
5. Menü IA + Muhasebe hub + Entegrasyon Ayarlar’da
6. Sipariş satırı → fabrika emri deep link

### P2 — Kanal

7. WA proposal → aynı execution dispatcher
8. Teklif arşivi + satışa dönüşüm (vol2)

### P3 — SaaS olgunluk

9. Tenant modül entitlement
10. `/is-akislari` admin → Ayarlar → Otomasyon kuralları
11. Observability: queue health, provider health (Ayarlar)

---

## 6. SaaS altyapı guardrail’leri (~500 kullanıcı)

Hedef: **500 eşzamanlı iç kullanıcı** (tenant başına ~5–50), çok kiracılı PostgreSQL, worker queue.

### Zorunlu mimari (zaten PREMIUM’da)

| Guardrail | Uygulama |
|-----------|----------|
| Tenant isolation | Her sorgu/mutation `tenantId` session’dan; cross-tenant yasak |
| Mutation zinciri | permission → policy → approval → transaction → audit → outbox |
| Fail-closed prod | Demo auth, mock token, eksik webhook secret kapalı |
| Idempotency | Kritik write’larda zorunlu (`action-registry`) |
| Outbox / worker | ERP, WA, belge async; API request’te uzun iş yok |
| Connection pool | PostgreSQL pool tenant başına limit; read replica (P3) |
| Rate limit | API + WA webhook; tenant bazlı |
| Audit | Tüm kritik mutation timeline |

### Ölçek notları (500 kullanıcı)

- **Web:** stateless Next.js; horizontal scale; session store Redis (production)
- **API:** tek monolith OK; p95 < 500ms liste; ağır iş worker’da
- **Worker:** approval dispatch, ERP sync, WA outbox — concurrency limit tenant başına
- **DB:** index tenantId + entity; partition arşiv (ileride); migration geri alınabilir
- **AI:** local-first; external fallback mutation execute etmez

### Patlamayı önleyen kurallar

1. UI’dan doğrudan DB/ERP/WA write yok  
2. Liste endpoint’leri sayfalı; tenant scope zorunlu  
3. Background job duplicate guard (WA webhook, approval)  
4. Production’da sessiz mock success yok  

Detay: [`docs/production-hardening-foundation.md`](./production-hardening-foundation.md), [`docs/durable-workflow-outbox-hardening.md`](./durable-workflow-outbox-hardening.md)

---

## 7. UI katman kararları (Final birincil)

| Route | Kanonik bileşen | Elenen / ikincil |
|-------|-----------------|------------------|
| `/dashboard` | `DashboardGostergePaneliPage` | `DashboardReferencePage`, `CommandCenter` (P1 veri) |
| `/hizli-islem` | `HizliSatisMasasiPage` → P0’da API bağlantısı | `HizliIslemMerkeziPage` (route yok) |
| `/archive` | `ArsivOperasyonMerkeziPage` | Eski `ArchivePage` (legacy path varsa kapı) |
| `/ayarlar` | `AyarlarHubPage` | — |
| `/muhasebe` | `MuhasebeHubPage` | Sidebar’da ayrı fatura/tahsilat/iade |
| `/fabrikalar/siparis` | `FabrikalarSiparisOperasyonPage` | `/fabrikalar/siparisler` redirect |
| Operasyon motoru | `QuickOperationPage` (P0 route) | Catch-all manifest shell |

Kaynak UI: `hallederizcrm final` — sandbox `apps/web/src/features/*` altında kopyalı; yeni ekran yazma yerine Final Page + mock + CSS pattern.

---

## 8. Kabul kriterleri (omurga tamam)

- [ ] Hızlı İşlem submit → onay kuyruğu → (onay sonrası) depo/fabrika kayıtları oluşur  
- [ ] Fabrika modülünde satıştan doğan emir görünür  
- [ ] Dashboard’da en az 3 operasyon kartı canlı/mock engine’den beslenir  
- [ ] Sidebar ≤13 kalem; ERP menüde değil  
- [ ] Tenant isolation + approval testleri geçer  
- [ ] `pnpm typecheck` + `smoke:navigation` PASS  

---

*Son güncelleme: 2026-05-27*
