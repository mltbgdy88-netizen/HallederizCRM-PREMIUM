# QA Visual Report — teslimatlar-detay-masasi

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/05-teslimatlar/detay/teslimatlar-detay-masasi-acik-mod.png`  
**Route:** http://localhost:3011/teslimatlar/detay  
**Implementer iddiası:** pass

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | |
| `pnpm build` | FAIL | Dev aktif |
| Body scroll yok | PASS | |
| Route erişilebilir | PASS | HTTP 200 |

---

## 3. Metin ve veri (mock)

| Alan | Referans | Uygulama | Sonuç |
|------|----------|----------|-------|
| Başlık | Teslimat TSL-441 | TSL-441 | PASS |
| Toplam | ₺19.840,00 | ₺19.840,00 | PASS |
| Kalem 2 ad | V Kayışı **SPB 1600** | V Kayışı **B-52** | FAIL |
| Kalem 3 ad | Elektrik Motoru **7.5 kW** | Elektrik Motoru **2.2kW** | FAIL |
| Kanıt / imza | Ahmet Demir + foto | `TSDM_PROOF` | PASS |

---

## 4. Fark listesi

1. **Teslimat Kalemleri** satır 2–3 ürün adları PNG ile farklı (`TSDM_LINES`).
2. 8 kalem, 68 adet, metrik şeridi ve not metni uyumlu.
3. Sağ bağlam SP-705 / SVK-332 / Merkez Depo doğru.
4. Layout 3 sütun + kanıt paneli referansla uyumlu.
5. REVIZE: `teslimatlar-detay-mock.ts` → `TSDM_LINES` name alanları PNG.

---

## 5. Karar

- [ ] **PASS**
- [x] **FAIL** → REVIZE (kalem ürün metinleri)

**Auditor imzası:** PNG okundu; tablo ürün drift → FAIL.
