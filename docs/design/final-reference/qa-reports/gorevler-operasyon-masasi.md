# QA Visual Report — gorevler-operasyon-masasi

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/11-gorevler/liste/gorevler-operasyon-masasi-acik-mod.png`  
**Route:** http://localhost:3011/gorevler  
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
| KPI Açık Görev | 156 +12% | 156 +12% | PASS |
| Satır 1 başlık | Fabrika stok sayımı… | Aynı | PASS |
| Satır 2 başlık | **UR-10001 teklif hazırlanması** | **Müşteri ziyaret raporu…** | FAIL |
| Bağlam atanan | **Yusuf Kaya** (PNG panel) | **Ahmet Demir** (`getGomContext`) | FAIL |

---

## 4. Fark listesi

1. Tablo satır 2–3 görev başlıkları PNG ≠ `GOM_TABLE_ROWS`.
2. Sağ panel seçili görevde atanan PNG **Yusuf Kaya**; mock **Ahmet Demir**.
3. Checklist 3/6 maddeleri PNG ile kısmen farklı metinler.
4. 5 KPI trend etiketleri PASS.
5. REVIZE: `gorevler-operasyon-mock.ts` → tablo + `CONTEXTS["1"]`.

---

## 5. Karar

- [ ] **PASS**
- [x] **FAIL** → REVIZE

**Auditor imzası:** PNG okundu; tablo/bağlam drift → FAIL.
