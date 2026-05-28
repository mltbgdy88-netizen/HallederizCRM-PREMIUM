# QA Visual Report — faturalar-detay-masasi

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/06-faturalar/detay/faturalar-detay-masasi-acik-mod.png`  
**Route:** http://localhost:3011/faturalar/detay  
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
| Fatura ID | FT-992 | FT-992 | PASS |
| Genel toplam | ₺94.500,00 | ₺94.500,00 | PASS |
| Belge No (bağlam) | **A1B2C3D4E5F6** | **FT-992-2025** | FAIL |
| Müşteri | ABC Teknoloji A.Ş. | ABC Teknoloji A.Ş. | PASS |

---

## 4. Fark listesi

1. **Fatura Bağlamı** Belge No PNG alfanumerik **A1B2C3D4E5F6**; mock **FT-992-2025** (`FDM_CONTEXT`).
2. Özet sekmesi, toplamlar, ödeme bilgisi ve PDF önizleme satırları uyumlu.
3. E-Fatura GİB şeridi ve işlem butonları PASS.
4. Oluşturma zamanı PNG saniye hassasiyetli (kozmetik).
5. REVIZE: `faturalar-detay-mock.ts` → `FDM_CONTEXT.rows` Belge No.

---

## 5. Karar

- [ ] **PASS**
- [x] **FAIL** → REVIZE

**Auditor imzası:** PNG okundu; belge no drift → FAIL.
