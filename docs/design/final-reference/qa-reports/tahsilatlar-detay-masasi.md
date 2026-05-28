# QA Visual Report — tahsilatlar-detay-masasi

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/04-tahsilatlar/detay/tahsilatlar-detay-masasi-acik-mod.png`  
**Route:** http://localhost:3011/tahsilatlar/detay  
**Implementer iddiası:** pass

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | `tahsilatlar-detay-masasi-acik-mod.png` okundu |
| `pnpm build` | FAIL | Dev aktif |
| Body scroll yok | PASS | `.thdm-home { overflow: hidden }` |
| Route erişilebilir | PASS | HTTP 200 |

---

## 2. Layout karşılaştırması (referans ↔ uygulama)

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk (sidebar/header) | Tahsilatlar aktif | AppShell | PASS |
| Başlık / alt başlık | TH-1192 detay masası | `THDM_PAGE` | PASS |
| KPI / üst şerit | 6 özet kart | `THDM_SUMMARY` kartları | PASS |
| Ana grid sütunları | Bilgi + dağılım + sağ bağlam | 3 bölge | PASS |
| Tablolar / listeler | 3 fatura satırı | `THDM_INVOICES` | PASS |
| Sağ panel (AI vb.) | Bağlam, bağlı faturalar, özet | `THDM_CONTEXT` vb. | FAIL |
| Renk / canvas tonu | Açık canvas | Uyumlu | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans değer | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Tahsilat No | TH-1192 | TH-1192 | PASS |
| Tutar | ₺68.750,00 | ₺68.750,00 | PASS |
| Dağılım footer kalan | ₺15.000,00 (PNG) | ₺16.000,00 (`THDM_DIST_FOOTER`) | FAIL |
| Eşleşen tutar (özet) | ₺53.750,00 (PNG) | ₺68.750,00 (`THDM_OVERVIEW`) | FAIL |
| Eşleşme durumu | Kısmi Eşleşti | Kısmi Eşleşti | PASS |

---

## 4. Fark listesi (zorunlu, min 1 satır)

1. **Tahsilat Özeti** sağ panel: referansta **Eşleşen Tutar ₺53.750,00** ve **Kalan ₺15.000,00**; mock **₺68.750,00 / ₺16.000,00**.
2. Dağılım tablosu footer **Toplam Kalan** PNG **₺15.000,00**; mock **₺16.000,00** (`THDM_DIST_FOOTER.remaining`).
3. Zaman çizelgesi 5 adım ve müşteri ABC İnşaat — uyumlu.
4. Fatura satırları FAT-0487/0501/0512 tutarları uyumlu; özet toplamları tutarsız.
5. REVIZE: `tahsilatlar-detay-mock.ts` → `THDM_OVERVIEW`, `THDM_DIST_FOOTER` PNG rakamları.

---

## 5. Karar

- [ ] **PASS** → Director final sign-off için `qa-pass`
- [x] **FAIL** → REVIZE (finansal özet drift)

**Auditor imzası:** PNG okundu; layout PASS, özet tutarları PNG ≠ mock → FAIL.
