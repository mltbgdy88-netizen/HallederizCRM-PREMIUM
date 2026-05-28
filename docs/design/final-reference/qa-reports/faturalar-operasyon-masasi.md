# QA Visual Report — faturalar-operasyon-masasi

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/06-faturalar/liste/faturalar-operasyon-masasi-acik-mod.png`  
**Route:** http://localhost:3011/faturalar  
**Implementer iddiası:** pass (2026-05-27)

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
| KPI Toplam Fatura | 256 | 256 | PASS |
| INV-2025-0256 | Kesildi / Bekliyor | Aynı | PASS |
| Bağlam cari kod | **CAR-1001** | **ABC001** | FAIL |
| Tutar bağlam | ₺85.000,00 | ₺85.000,00 | PASS |

---

## 4. Fark listesi

1. **Fatura Bağlamı** cari kodu PNG **CAR-1001**; mock **ABC001** (`FAT_CONTEXT_BY_ROW`).
2. 5 KPI, filtre şeridi, 8 satır tablo PNG ile hizalı.
3. Ödeme rozetleri (Bekliyor/Kısmi/Ödendi) doğru.
4. Layout tablo + sağ panel PASS.
5. REVIZE: `faturalar-operasyon-mock.ts` → `accountCode`.

---

## 5. Karar

- [ ] **PASS**
- [x] **FAIL** → REVIZE

**Auditor imzası:** PNG okundu; bağlam cari kodu drift → FAIL.
