# QA Visual Report — iadeler-yeni-form

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/07-iadeler/yeni/iadeler-yeni-form-acik-mod.png`  
**Route:** http://localhost:3011/iadeler/yeni  
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
| Sipariş No | SIP-2025-000124 | SIP-2025-000124 | PASS |
| Satır 1 iade miktar | **2** × ₺85 = **₺170** | **1** × ₺45 = **₺45** | FAIL |
| Satır 2 ürün | **V Kayışı SPB 1600** | **Conta Seti DN50** | FAIL |
| Seçilen toplam | 3 kalem / ₺290 | `IYF_SELECTED_TOTAL` metin doğru, satır tutarsız | FAIL |

---

## 4. Fark listesi

1. **Sipariş satırları** ürün adları, birim fiyat ve iade miktarları PNG ≠ `IYF_LINES`.
2. 4 adımlı stepper ve sipariş bilgi kartı layout PASS.
3. Depo etkisi önizleme Merkez Depo / ₺290,00 üst metin PASS (satır hesabı yanlış).
4. Alt uyarı şeridi PASS.
5. REVIZE: `iadeler-yeni-form-mock.ts` → `IYF_LINES` PNG bire bir (UR-10001, SPB 1600, motor satırları).

---

## 5. Karar

- [ ] **PASS**
- [x] **FAIL** → REVIZE

**Auditor imzası:** PNG okundu; satır mock drift → FAIL.
