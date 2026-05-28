# QA Visual Report — teslimatlar-rota-operasyon-masasi

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/05-teslimatlar/rota/teslimatlar-rota-operasyon-masasi-acik-mod.png`  
**Route:** http://localhost:3011/teslimatlar/rota  
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
| KPI Toplam Rota | 12 | 12 | PASS |
| RT-00012 mesafe (bağlam) | **48,6 km** | **42,8 km** | FAIL |
| RT-00012 bitiş | **11:05** | **11:20** | FAIL |
| Durak listesi | 6 durak isimleri | `TSRM_STOPS` | PASS |

---

## 4. Fark listesi

1. **Rota Bağlamı** RT-00012: PNG **Toplam Mesafe 48,6 km** ve **Bitiş 11:05**; mock **42,8 km** / **11:20** (`TSRM_CONTEXT`).
2. Üst KPI şeridi ve şoför kartları PNG ile uyumlu.
3. Rota tablosu 3 satır kolonları eşleşiyor.
4. Harita şeridi ve durak timeline layout PASS.
5. REVIZE: `teslimatlar-rota-mock.ts` → `TSRM_CONTEXT` distance/end.

---

## 5. Karar

- [ ] **PASS**
- [x] **FAIL** → REVIZE

**Auditor imzası:** PNG okundu; sağ bağlam sayıları drift → FAIL.
