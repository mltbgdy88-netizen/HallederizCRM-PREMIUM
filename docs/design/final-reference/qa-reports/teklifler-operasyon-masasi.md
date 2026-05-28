# QA Visual Report — teklifler-operasyon-masasi

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/01-teklifler/liste/teklifler-operasyon-masasi-acik-mod.png`  
**Route:** http://localhost:3011/teklifler  
**Implementer iddiası:** pass (REVIZE batch)  
**Re-QA (2026-05-27):** Post-REVIZE — tablo tarihleri ve bağlam Ahmet Yılmaz PNG ile hizalı.

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | `teklifler-operasyon-masasi-acik-mod.png` okundu |
| `pnpm build` | PASS | `pnpm stop-dev` → `pnpm build` — 85 route |
| Body scroll yok | PASS | `.tom-home { overflow: hidden }` |
| Route erişilebilir | PASS | `/teklifler` build çıktısında |

---

## 2. Layout karşılaştırması (referans ↔ uygulama)

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk (sidebar/header) | Premium CRM, Teklifler aktif | AppShell, Teklifler aktif | PASS |
| Başlık / alt başlık | Teklifler Operasyon Masası | `TOM_TITLE` / `TOM_SUBTITLE` | PASS |
| KPI / üst şerit | 5 KPI + dönüşüm %18,6 | `TOM_KPIS` | PASS |
| Ana grid sütunları | Tablo + sağ Teklif Bağlamı | İki sütun workspace | PASS |
| Tablolar / listeler | 8 satır, TKL-0487 seçili | `TOM_TABLE_ROWS` ×8 | PASS |
| Sağ panel | Uyarılar + sonraki adımlar | `TOM_CONTEXT_BY_ROW["1"]` | PASS |
| Renk / canvas tonu | Açık gri-yeşil canvas | Açık canvas | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans değer | Uygulama | Sonuç |
|------|----------------|----------|-------|
| TKL-0487 Geçerlilik | 20.06.2025 | 20.06.2025 | PASS |
| TKL-0487 Takip | 15.05.2025 | 15.05.2025 | PASS |
| Bağlam oluşturma | 15.05.2025 | 15.05.2025 | PASS |
| Bağlam yetkili | Ahmet Yılmaz | Ahmet Yılmaz | PASS |
| Son takip uyarısı | 15.05.2025 | 15.05.2025 | PASS |
| Sonraki adımlar | 16 / 19 / 22.05.2025 | `nextSteps` aynı | PASS |

---

## 4. Fark listesi (zorunlu, min 1 satır)

1. Gözle görülür layout/metin farkı yok — REVIZE tablo/bağlam tarihleri tamam.
2. Demo banner metni PNG ile aynı (`TOM_DEMO_BANNER`).
3. Tablo toplam “Toplam 248 kayıt” eşleşiyor.
4. Seçili satır altın çerçeve CSS ile uygulanıyor (kozmetik kalınlık ±1px).
5. Dışa Aktar / Hızlı Teklif üst CTA’lar mevcut.

---

## 5. Karar

- [x] **PASS** → Director final sign-off için `qa-pass`
- [ ] **FAIL** → REVIZE

**Auditor imzası:** PNG okundu, `teklifler-operasyon-mock.ts` bire bir doğrulandı, `pnpm build` PASS.
