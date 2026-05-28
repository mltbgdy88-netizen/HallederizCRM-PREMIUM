# QA Visual Report — gorevler-detay-masasi

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/11-gorevler/detay/gorevler-detay-masasi-acik-mod.png`  
**Route:** http://localhost:3011/gorevler/detay  
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

1. **Stok Sayımı ve Raporlama**, TSK-2025-000142, Yusuf Kaya — `GDM_PAGE` PASS.
2. Özet şeridi, checklist 2/4, yorumlar (2) PASS.
3. Sağ bağlam bağlantılı kayıtlar ve ilişkili görevler PASS.
4. Sekmeler ve Düzenle/Tamamlandı aksiyonları PASS.
5. Gözle görülür drift yok.

---

## 5. Karar

- [x] **PASS**
- [ ] **FAIL**

**Auditor imzası:** PNG okundu → PASS.
