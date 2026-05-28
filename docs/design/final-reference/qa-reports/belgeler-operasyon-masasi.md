# QA Visual Report — belgeler-operasyon-masasi

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/10-belgeler/liste/belgeler-operasyon-masasi-acik-mod.png`  
**Route:** http://localhost:3011/belgeler  
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
| KPI Yüklenen | 1.248 | 1.248 | PASS |
| Bağlam Belge No | **BEL-2025-000124** | **BLG-2025-0124** | FAIL |
| Bağlam Cari | **ABC Otomotiv A.Ş.** | **ABC Elektronik Ltd. Şti.** | FAIL |
| Bağlam tarih | **20.05.2025 14:35** | **15.05.2025** | FAIL |

---

## 4. Fark listesi

1. **Belge Bağlamı** panel metadata PNG ≠ `getBomContext` (no, cari, tarih).
2. Tablo BLG-2025-0124 satırları ve 4 KPI PASS.
3. Dosya adı FATURA_ABC… PDF uyumlu.
4. Layout liste + bağlam PASS.
5. REVIZE: `belgeler-operasyon-mock.ts` → `CONTEXTS["1"]`.

---

## 5. Karar

- [ ] **PASS**
- [x] **FAIL** → REVIZE

**Auditor imzası:** PNG okundu; bağlam drift → FAIL.
