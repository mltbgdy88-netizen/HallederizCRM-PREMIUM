# QA Visual Report — rapor-operasyon-merkezi

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/00-onayli-sprint1/raporlar/liste/rapor-operasyon-merkezi-acik-mod.png`  
**Route:** http://localhost:3011/raporlar  
**Implementer iddiası:** pass (REVIZE batch)  
**Re-QA (2026-05-27):** Post-REVIZE — KPI trend, tablo fark ve bağlam PNG ile hizalı.

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | Sprint1 `rapor-operasyon-merkezi-acik-mod.png` okundu |
| `pnpm build` | PASS | `pnpm stop-dev` → `pnpm build` — 85 route |
| Body scroll yok | PASS | `.rom-home { overflow: hidden }` |
| Route erişilebilir | PASS | `/raporlar` build çıktısında |

---

## 2. Layout karşılaştırması (referans ↔ uygulama)

| # | Bölge | Referans | Uygulama | Sonuç |
|---|-------|----------|----------|-------|
| 1 | Kabuk + başlık | Rapor Operasyon Merkezi; 6 sekme; + Rapor Oluştur / PDF / Excel | `ROM_PAGE` + `ROM_TABS` + CTA | PASS |
| 2 | KPI şeridi (6) | Ciro %18,6; Tahsilat %16,2; … AI %22,1 | `ROM_KPIS` trend metinleri | PASS |
| 3 | Filtre şeridi | 01.05–31.05 / 01.04–30.04 / Tümü | `ROM_FILTERS` | PASS |
| 4 | Metrik tablosu (8) | Tam dönem; Fark %12,5 / %31,6 / %53,3 | `ROM_TABLE_ROWS` | PASS |
| 5 | Sağ Rapor Bağlamı | 01.06.2025 09:41; 4 link; 4 aksiyon | `ROM_CONTEXT_BY_ROW["1"]` | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans değer | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Ciro KPI trend | ↗ %18,6 | ↗ %18,6 | PASS |
| Tahsilat trend | ↗ %16,2 | ↗ %16,2 | PASS |
| Açık Bakiye trend | ↗ %7,8 | ↗ %7,8 | PASS |
| Tablo Açık Bakiye Fark | +%31,6 ↑ | +%31,6 ↑ | PASS |
| Tablo Kritik Stok Fark | +%53,3 ↑ | +%53,3 ↑ | PASS |
| Bağlam oluşturma | 01.06.2025 09:41 | 01.06.2025 09:41 | PASS |
| Kaynak linkleri | 4 adet | 4 adet | PASS |
| Önerilen aksiyonlar | 4 madde (2 işaretli) | 4 madde | PASS |

---

## 4. Fark listesi (zorunlu, min 1 satır)

1. Gözle görülür layout/metin farkı yok — REVIZE maddeleri (trend %, tablo dönem/fark, bağlam tarih) tamam.
2. Sidebar marka PNG “VERDE CRM”; AppShell Premium CRM (ortak kabuk).
3. Sparkline çizgileri dekoratif; sayısal KPI değerleri PNG ile aynı.
4. Tablo segment sütunu satır bazında farklı (PNG ile uyumlu).
5. Progress bar %112,5 görsel doluluk yaklaşık (kozmetik).

---

## 5. Karar

- [x] **PASS** → Director final sign-off için `qa-pass`
- [ ] **FAIL** → REVIZE

**Auditor imzası:** PNG okundu, `rapor-operasyon-mock.ts` bire bir doğrulandı, `pnpm build` PASS.
