# QA Visual Report — teslimatlar-operasyon-masasi

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/05-teslimatlar/liste/teslimatlar-operasyon-masasi-acik-mod.png`  
**Route:** http://localhost:3011/teslimatlar  
**Implementer iddiası:** pass

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | PNG okundu |
| `pnpm build` | FAIL | Dev aktif |
| Body scroll yok | PASS | `.tsm-home { overflow: hidden }` |
| Route erişilebilir | PASS | HTTP 200 |

---

## 2. Layout karşılaştırması

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk | Teslimatlar aktif | AppShell | PASS |
| Başlık | Teslimatlar Operasyon Masası | `TSM_TITLE` | PASS |
| KPI | 5 kart 1.248…72 | `TSM_KPIS` | PASS |
| Grid | Tablo + Teslim Bağlamı | İki sütun | PASS |
| Tablo | TES-10001…08 | `TSM_TABLE_ROWS` | PASS |
| Sağ panel | TES-10001 bağlam | `getTsmContext` | FAIL |
| Renk | Açık canvas | Uyumlu | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans | Uygulama | Sonuç |
|------|----------------|----------|-------|
| TES-10001 müşteri | ABC İnşaat… | ABC İnşaat San. ve Tic. A.Ş. | PASS |
| Şoför (bağlam) | Mehmet **Yıldız** | Mehmet **Yılmaz** | FAIL |
| Toplam miktar | 1.250 / 650 / 600 | Aynı | PASS |

---

## 4. Fark listesi

1. **Teslim Bağlamı** seçili satır şoför adı PNG **Mehmet Yıldız**; mock **Mehmet Yılmaz** (`TSM_CONTEXT_BY_ROW`).
2. Tablo 8 satır ve durum rozetleri PNG ile uyumlu.
3. Aksiyonlar Detay/Belge/Etiket mevcut.
4. `pnpm build` atlandı (dev).
5. REVIZE: `teslimatlar-operasyon-mock.ts` → `driver` alanı PNG.

---

## 5. Karar

- [ ] **PASS**
- [x] **FAIL** → REVIZE (şoför adı)

**Auditor imzası:** PNG okundu; bağlam metin drift → FAIL.
