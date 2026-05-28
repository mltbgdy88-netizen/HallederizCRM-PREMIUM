# QA Visual Report — iadeler-operasyon-masasi

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/07-iadeler/liste/iadeler-operasyon-masasi-acik-mod.png`  
**Route:** http://localhost:3011/iadeler  
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
| KPI Toplam İade | 124 | 124 | PASS |
| İA-2025-000124 | Bekliyor | Bekliyor | PASS |
| Sipariş No (satır 1) | **SP-2025-001245** | **SIP-2025-1587** | FAIL |
| Cari (satır 1) | **ABC Mağazacılık A.Ş.** | **ABC Otomasyon San. ve Tic. Ltd. Şti.** | FAIL |

---

## 4. Fark listesi

1. Tablo **Sipariş No** ve **Cari** sütunları PNG ile uyuşmuyor (`IAD_TABLE_ROWS` satır 1).
2. 6 KPI ve sağ **İade Bağlamı** finansal/stok etkisi (-₺12.450 / +25) seçili satırda uyumlu.
3. Demo banner ve filtre şeridi PASS.
4. Layout liste + bağlam PASS.
5. REVIZE: `iadeler-operasyon-mock.ts` → `orderNo`, `customer` PNG bire bir.

---

## 5. Karar

- [ ] **PASS**
- [x] **FAIL** → REVIZE

**Auditor imzası:** PNG okundu; tablo metin drift → FAIL.
