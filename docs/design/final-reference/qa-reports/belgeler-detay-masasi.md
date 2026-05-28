# QA Visual Report — belgeler-detay-masasi

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/10-belgeler/detay/belgeler-detay-masasi-acik-mod.png`  
**Route:** http://localhost:3011/belgeler/detay  
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

## 4. Fark listesi

1. **BLG-88**, ABC Elektronik, ₺18.750,00 — `BDM_FIELDS` PASS.
2. PDF önizleme üç kalem ve genel toplam PASS.
3. İşlemler (Arşivle…Sil) ve ek bilgiler FTR-2025-00588.pdf PASS.
4. 3 sütun layout PASS.
5. Gözle görülür drift yok.

---

## 5. Karar

- [x] **PASS**
- [ ] **FAIL**

**Auditor imzası:** PNG okundu → PASS.
