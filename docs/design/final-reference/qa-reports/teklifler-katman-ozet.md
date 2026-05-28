# QA Visual Report — teklifler-katman-ozet

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/01-teklifler/katmanlar/ozet/teklifler-katman-ozet-acik-mod.png`  
**Route:** http://localhost:3011/teklifler/katman/ozet  
**Implementer iddiası:** pass (REVIZE batch)  
**Re-QA (2026-05-27):** Post-REVIZE — 6 sekme sırası + M-10015 PNG ile hizalı.

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | `teklifler-katman-ozet-acik-mod.png` okundu |
| `pnpm build` | PASS | `pnpm stop-dev` → `pnpm build` |
| Body scroll yok | PASS | `.tkm-home { overflow: hidden }` |
| Route erişilebilir | PASS | `/teklifler/katman/ozet` build çıktısında |

---

## 2. Layout karşılaştırması (referans ↔ uygulama)

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk | Teklifler aktif | AppShell | PASS |
| Başlık | Teklif TK-8821 + müşteri şeridi | `OZET_HEADER` | PASS |
| KPI şeridi | 4 tutar kartı | `OZET_KPIS` | PASS |
| Sekmeler | Özet→Satırlar→Müşteri→Dönüşüm→Belgeler→Timeline | `KATMAN_TABS` (6) | PASS |
| Sağ bağlam | Teklif Katman Bağlamı | `KATMAN_CONTEXT` | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans değer | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Toplam tutar | ₺1.064.100,00 | Aynı | PASS |
| Müşteri kodu | M-10015 | M-10015 | PASS |
| Teklif no | TK-8821 | TK-8821 | PASS |
| Kampanya | Bahar Kampanyası | Aynı | PASS |
| Geçerlilik | 28.06.2025 / 20 gün kaldı | Aynı | PASS |

---

## 4. Fark listesi (zorunlu, min 1 satır)

1. Gözle görülür layout/metin farkı yok — sekme sırası ve müşteri kodu REVIZE tamam.
2. Detay grid sol/sağ alan etiketleri PNG ile eşleşiyor.
3. Hızlı işlemler 5 buton sırası doğru.
4. Kurumsal badge ve vergi no satırı mevcut.
5. İndirim tutarı kırmızı vurgu CSS (kozmetik).

---

## 5. Karar

- [x] **PASS** → Director final sign-off için `qa-pass`
- [ ] **FAIL** → REVIZE

**Auditor imzası:** PNG okundu, `teklifler-katman-mock.ts` bire bir doğrulandı, `pnpm build` PASS.
