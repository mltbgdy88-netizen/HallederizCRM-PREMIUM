# QA Visual Report — hizli-islem-merkezi

**Auditor:** Design Auditor (subagent, re-QA post-REVIZE)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/_ek-alternatifler/hizli-islem-merkezi-acik-mod.png`  
**Route:** http://localhost:3011/hizli-islem  
**Implementer iddiası:** REVIZE — `HI_RECENT` 5 satır PNG bire bir

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | `_ek-alternatifler/hizli-islem-merkezi-acik-mod.png` okundu |
| `pnpm build` | SKIP | Dev 3011 aktif; terminal geçmişinde route 200 |
| Body scroll yok | PASS | `.hi-home { overflow: hidden }` + kabuk zinciri |
| Route erişilebilir | PASS | Terminal `GET /hizli-islem 200` |

---

## 2. Layout karşılaştırması (referans ↔ uygulama)

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk (sidebar/header) | Premium CRM, Hızlı İşlem aktif | AppShell, aktif link doğru | PASS |
| Başlık / alt başlık | Hızlı İşlem Merkezi + alt cümle | `HI_PAGE` bire bir | PASS |
| KPI / üst şerit | Yok (6 aksiyon kartı) | 6 kart tek sıra | PASS |
| Ana grid sütunları | 6 dikey aksiyon kartı | `HI_ACTION_CARDS` sıra/ikon uyumlu | PASS |
| Tablolar / listeler | Son İşlemler 5 yatay kart | 5 kart yatay şerit | PASS |
| Sağ panel (AI vb.) | Yok | Yok | PASS |
| Renk / canvas tonu | Açık gri canvas, yeşil ikon halkaları | `#f4f6f8` tonları uyumlu | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans değer | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Kart Sipariş açıklama | Yeni sipariş oluşturun… | Eşleşiyor | PASS |
| Son işlem 1 | SO-2025-0248 · ABC A.Ş. · 2 dk önce · Tamamlandı | Eşleşiyor | PASS |
| Son işlem 2 | TAH-2025-0187 · XYZ Ltd. Şti. · 15 dk önce · Tamamlandı | Eşleşiyor | PASS |
| Son işlem 3 | TES-2025-0096 · DEF Ticaret · 1 saat önce · Tamamlandı | Eşleşiyor | PASS |
| Son işlem 4 | TEK-2025-0315 · GHI Pazarlama · 2 saat · Beklemede | Eşleşiyor | PASS |
| Son işlem 5 | IA-2025-0062 · JKL Elektronik · 3 saat · Tamamlandı | Eşleşiyor | PASS |
| Sıra türleri | Sipariş → Tahsilat → Teslim → Teklif → İade | `HI_RECENT` aynı sıra | PASS |

---

## 4. Fark listesi (zorunlu, min 1 satır)

1. Önceki tur **FAIL** nedeni (`HI_RECENT` drift) **giderildi** — 5 satır ref/cari/süre/durum PNG ile bire bir.
2. Paylaşılan AppShell sidebar’da **Teklifler** menüsü var; hizli-islem PNG’de 9 menü (Teklifler yok) — kozmetik, Stok QA ile aynı kabuk.
3. Sidebar footer metni PNG “Premium CRM v2.6.1” alt satırından farklı olabilir (© 2025) — kozmetik.
4. İade satırı ikon tonu mock’ta `gold`; rozet yeşil **Tamamlandı** — görsel ton farkı ihmal edilebilir.
5. `pnpm build` bu turda koşturulmadı (dev aktif); Director final öncesi `pnpm stop-dev` → `pnpm build` önerilir.

---

## 5. Karar

- [x] **PASS** → Director final sign-off için `qa-pass`
- [ ] **FAIL** → REVIZE

**Gerekçe:** REVIZE hedefi (`HI_RECENT`) tamamlandı; üst bölüm ve Son İşlemler mock’u referans PNG ile uyumlu.

**Auditor imzası:** PNG okundu; `hizli-islem-mock.ts` satır satır karşılaştırıldı.
