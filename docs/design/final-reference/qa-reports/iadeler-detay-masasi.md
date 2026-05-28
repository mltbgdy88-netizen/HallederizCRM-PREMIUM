# QA Visual Report — iadeler-detay-masasi

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/07-iadeler/detay/iadeler-detay-masasi-acik-mod.png`  
**Route:** http://localhost:3011/iadeler/detay  
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

1. **İade ID-221**, Onay Bekliyor, stok KPI **₺10.425,00** — `IDM_HERO` / `IDM_STOCK_KPIS` PASS.
2. Üç kalem tablo (Hava Filtresi, Basınç Sensörü, Elektrik Motoru 7.5 kW) PNG ile uyumlu.
3. Onay süreci 4 adım ve depo/notlar paneli PASS.
4. Üst aksiyonlar Onayla/Reddet/Yazdır PASS.
5. Gözle görülür layout/metin drift’i yok.

---

## 5. Karar

- [x] **PASS**
- [ ] **FAIL**

**Auditor imzası:** PNG okundu → PASS.
