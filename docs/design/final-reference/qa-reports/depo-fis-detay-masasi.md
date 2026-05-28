# QA Visual Report — depo-fis-detay-masasi

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/08-depo/detay-fis/depo-fis-detay-masasi-acik-mod.png`  
**Route:** http://localhost:3011/depo/detay  
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

1. **DF-771** fiş, Onaylandı/Çıkış, 6 toplama satırı ve ₺4.795 toplam PASS.
2. Meta SS-5689, Blue Com açıklama, işlem geçmişi 4 adım PASS.
3. Sağ depo kapasite uyarıları ve ilgili belgeler PASS.
4. Ürün satır adları (Rulman, Hidrolik Yağ, KP-200 vb.) PNG ile uyumlu.
5. Gözle görülür drift yok.

---

## 5. Karar

- [x] **PASS**
- [ ] **FAIL**

**Auditor imzası:** PNG okundu → PASS.
