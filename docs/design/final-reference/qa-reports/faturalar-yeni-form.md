# QA Visual Report — faturalar-yeni-form

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/06-faturalar/yeni/faturalar-yeni-form-acik-mod.png`  
**Route:** http://localhost:3011/faturalar/yeni  
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

1. Üç sütun form (Cari / Fatura / Diğer) ve üst aksiyonlar PNG ile uyumlu.
2. Fatura No **FA-2025-000123**, tarihler 17.05 / 24.05 — `FYF_INVOICE` PASS.
3. Satır tablosu kolonları ve KDV dökümü PASS; mock tek boş satır, PNG üç satır (kozmetik).
4. Genel toplam 0,00 ₺ kutusu PASS.
5. Gözle görülür metin drift’i yok.

---

## 5. Karar

- [x] **PASS**
- [ ] **FAIL**

**Auditor imzası:** PNG okundu → PASS.
