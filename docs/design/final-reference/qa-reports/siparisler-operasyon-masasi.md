# QA Visual Report — siparisler-operasyon-masasi

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/02-siparisler/liste/siparisler-operasyon-masasi-acik-mod.png`  
**Route:** http://localhost:3011/siparisler  
**Implementer iddiası:** pass (REVIZE batch)  
**Re-QA (2026-05-27):** Post-REVIZE — `SIP_TABLE_ROWS` + ABC İnşaat bağlam PNG ile hizalı.

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | `siparisler-operasyon-masasi-acik-mod.png` okundu |
| `pnpm build` | PASS | `pnpm stop-dev` → `pnpm build` |
| Body scroll yok | PASS | `.sip-home { overflow: hidden }` |
| Route erişilebilir | PASS | `/siparisler` build çıktısında |

---

## 2. Layout karşılaştırması (referans ↔ uygulama)

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk | Siparişler aktif | AppShell | PASS |
| Başlık | Siparişler Operasyon Masası | `SIP_TITLE` / `SIP_SUBTITLE` | PASS |
| KPI şeridi | 5 KPI | `SIP_KPIS` | PASS |
| Tablo | 8 satır SP-01248… | `SIP_TABLE_ROWS` ×8 | PASS |
| Sağ bağlam | Sipariş Bağlamı ABC İnşaat | `SIP_CONTEXT_BY_ROW["1"]` | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans değer | Uygulama | Sonuç |
|------|----------------|----------|-------|
| SP-01248 Müşteri | ABC İnşaat San. ve Tic. A.Ş. | Aynı | PASS |
| Bağlam yetkili | Ahmet Yılmaz | Ahmet Yılmaz | PASS |
| Genel toplam | ₺125.430,00 | Aynı | PASS |
| KPI Açık Sipariş | 1.248 | 1.248 | PASS |
| Arama placeholder | Müşteri ara… | `SIP_FILTER_SEARCH_PLACEHOLDER` | PASS |
| Tablo satır 2–8 | PNG unvanları | Mock sıra eşleşiyor | PASS |

---

## 4. Fark listesi (zorunlu, min 1 satır)

1. Gözle görülür layout/metin farkı yok — 8 müşteri unvanı ve bağlam REVIZE tamam.
2. Tablo “Toplam 1.248 kayıt” eşleşiyor.
3. Ödeme uyarısı kutusu ve “Vadesi Gelenleri Gör (3)” mevcut.
4. Demo banner metni standart POC.
5. Seçili satır altın çerçeve (kozmetik).

---

## 5. Karar

- [x] **PASS** → Director final sign-off için `qa-pass`
- [ ] **FAIL** → REVIZE

**Auditor imzası:** PNG okundu, `siparisler-operasyon-mock.ts` bire bir doğrulandı, `pnpm build` PASS.
