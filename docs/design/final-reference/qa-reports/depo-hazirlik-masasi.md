# QA Visual Report — depo-hazirlik-masasi

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/08-depo/liste-hazirlik/depo-hazirlik-masasi-acik-mod.png`  
**Route:** http://localhost:3011/depo  
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

1. 5 KPI (36/24/8/12/5) ve sekme Bekleyenler/Hazırlananlar PNG ile uyumlu.
2. Tablo HZR-2025-00036…00029 ve durum rozetleri `DHM_TABLE_ROWS` PASS.
3. Sağ **Fiş Bağlamı** raf kapasitesi %68 (68/100) PASS.
4. Raf bölge etiketi PNG “A Bölgesi”; mock “Bölge A Bölgesi” (kozmetik).
5. Gözle görülür layout drift’i yok.

---

## 5. Karar

- [x] **PASS**
- [ ] **FAIL**

**Auditor imzası:** PNG okundu → PASS.
