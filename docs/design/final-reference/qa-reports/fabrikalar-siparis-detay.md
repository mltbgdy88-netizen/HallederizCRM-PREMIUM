# QA Visual Report — fabrikalar-siparis-detay

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/09-fabrikalar/siparis-detay/fabrikalar-siparis-detay-acik-mod.png`  
**Route:** http://localhost:3011/fabrikalar/siparis/detay  
**Implementer iddiası:** qa-review (W6 teslim)

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | `fabrikalar-siparis-detay-acik-mod.png` okundu |
| `pnpm build` | FAIL | Dev 3011 aktif |
| Body scroll yok | PASS | `.fsd-home { overflow: hidden }` |
| Route erişilebilir | PASS | HTTP 200 |

---

## 2. Layout karşılaştırması

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk | Fabrika Siparişleri aktif | AppShell | PASS |
| Başlık / breadcrumb | Fabrika Siparişleri > Detay | Eşleşiyor | PASS |
| KPI / üst şerit | Senkronize + SS-2025-00078 | Kartlar mevcut | PASS |
| Ana grid | Kalemler + özet + akış | 3 bölge | PASS |
| Tablolar / listeler | 5 kalem (Rulman, Elektrik Motoru…) | Farklı ürün seti | FAIL |
| Sağ panel | 2 hata UR-10003, UR-10005 | UR-10042, UR-10102 | FAIL |
| Renk / canvas | Açık operasyon tonu | Uyumlu | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Sipariş No | FO-2025-00124 | FO-2025-00124 | PASS |
| Sipariş tarihi | 24.05.2025 14:20 | 18.05.2025 | FAIL |
| Son senkron | 24.05.2025 14:32:18 | 20.05.2025 15:28 | FAIL |
| Genel toplam | ₺3.993.750,00 | ₺3.993.750,00 | PASS |
| Entegrasyon hata 1 | UR-10003 ham madde | UR-10042 | FAIL |
| Üretim % | 45,55 / 54,45 | 45,55 / 54,45 | PASS |

---

## 4. Fark listesi

1. Tarih alanları PNG Mayıs 24; mock Mayıs 18–20.
2. Kalem tablosu ürün adları/kodları PNG ile farklı (Elektrik Motoru vb. yok).
3. Sağ panel entegrasyon hataları yanlış UR kodları ve metinler.
4. Aktarım günlüğü zaman damgaları PNG ile tam hizalı değil.
5. `pnpm build` bu turda koşturulamadı.

---

## 5. Karar

- [ ] **PASS**
- [x] **FAIL** → REVIZE; `fabrikalar-siparis-detay-mock.ts` tarihler + `FSD_LINES` + `FSD_CONTEXT.errors` PNG bire bir

**Auditor imzası:** PNG okundu; FAIL mock drift nedeniyle.
