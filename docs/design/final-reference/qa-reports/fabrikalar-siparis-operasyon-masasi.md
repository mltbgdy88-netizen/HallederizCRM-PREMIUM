# QA Visual Report — fabrikalar-siparis-operasyon-masasi

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/09-fabrikalar/siparis-liste/fabrikalar-siparis-operasyon-masasi-acik-mod.png`  
**Route:** http://localhost:3011/fabrikalar/siparis  
**Implementer iddiası:** pass (REVIZE batch, re-QA 2026-05-27)

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | `fabrikalar-siparis-operasyon-masasi-acik-mod.png` okundu |
| `pnpm build` | PASS | `pnpm stop-dev` → clean `.next` → `pnpm build` — 85 route |
| Body scroll yok | PASS | `.fso-home { overflow: hidden }` + `100dvh` kabuk |
| Route erişilebilir | PASS | HTTP 200 |

---

## 2. Layout karşılaştırması (referans ↔ uygulama)

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk (sidebar/header) | Fabrika Siparişleri aktif | AppShell; nav highlight | PASS |
| Başlık / alt başlık | “takip edin” | “takip edin” | PASS |
| KPI / üst şerit | 6 kart; “Tamamlandı” | “Tamamlandı” | PASS |
| Ana grid sütunları | Tablo + sağ senkron paneli | İki sütun mevcut | PASS |
| Tablolar / listeler | 10 satır SP-2025-* | 10 satır SP-2025-* | PASS |
| Durum chip şeridi | “Tüm Durumlar” aktif | `useState("Tümü")` — eşleşmiyor | FAIL |
| Sağ panel (senkron) | “Hatalı Kayıt: 2” | “Hatalı Kayıt: 2” | PASS |
| Renk / canvas tonu | Açık gri-yeşil | `#f4f6f8` tonu | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans değer | Uygulama | Sonuç |
|------|----------------|----------|-------|
| KPI Toplam Sipariş | 1.245 | 1.245 | PASS |
| KPI Tamamlandı | Tamamlandı · 892 | Tamamlandı · 892 | PASS |
| Filtre arama | Sipariş no... | Sipariş no... | PASS |
| Durum chip | Tüm Durumlar (aktif) | Tümü (state; chip listesinde yok) | FAIL |
| Tablo satır 1 | SP-2025-10001 | SP-2025-10001 | PASS |
| Senkron özet | Hatalı Kayıt 2 | Hatalı Kayıt 2 | PASS |

---

## 4. Fark listesi (zorunlu, min 1 satır)

1. **Chip varsayılanı:** `FabrikalarSiparisOperasyonPage` `useState("Tümü")`; `FSO_STATUS_CHIPS[0]` = “Tüm Durumlar”.
2. Tablo 10 satır SP-2025-10001…10010 — PASS (REVIZE sonrası).
3. KPI ve senkron panel metinleri — PASS.
4. Filtre placeholder “Sipariş no...” — PASS.
5. Body scroll yok — PASS.

---

## 5. Karar

- [ ] **PASS** → Director final sign-off için `qa-pass`
- [x] **FAIL** → REVIZE; `FabrikalarSiparisOperasyonPage.tsx` chip `useState("Tüm Durumlar")`

**Auditor imzası:** PNG okundu, mock/CSS incelendi, bu rapor doldurulmadan FAIL verildi.
