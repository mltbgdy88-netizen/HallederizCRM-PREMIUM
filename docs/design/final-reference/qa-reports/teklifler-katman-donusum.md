# QA Visual Report — teklifler-katman-donusum

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/01-teklifler/katmanlar/siparise-donusturme/teklifler-katman-donusum-acik-mod.png`  
**Route:** http://localhost:3011/teklifler/katman/donusum  
**Implementer iddiası:** pass (post-REVIZE re-QA)

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | `teklifler-katman-donusum-acik-mod.png` okundu |
| `pnpm build` | PASS | 85 route (batch 2026-05-27) |
| Body scroll yok | PASS | `.tkm-home--donusum { overflow: hidden }` |
| Route erişilebilir | PASS | Build static route |

---

## 2. Layout karşılaştırması (referans ↔ uygulama)

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk (sidebar/header) | Teklifler aktif | AppShell | PASS |
| Başlık / alt başlık | TKL-2025-00048 · 30.06.2025 | `DONUSUM_HEADER` | PASS |
| KPI / üst şerit | 9 sekme; Dönüşüm aktif | `DONUSUM_DETAIL_TABS` | PASS |
| Ana grid sütunları | Sihirbaz + sağ bağlam | Wizard + context | PASS |
| Tablolar / listeler | 6 kalem stok | `DONUSUM_STOCK_ROWS` (6) | PASS |
| Sağ panel (AI vb.) | Rulman A.Ş. · 18.06.2025 | `DONUSUM_CONTEXT` | PASS |
| Renk / canvas tonu | Açık canvas | Açık canvas | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans değer | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Geçerlilik | 30.06.2025 | 30.06.2025 | PASS |
| Stok özet | 6 / 5 / 1 / 0 | `DONUSUM_STOCK_SUMMARY` | PASS |
| Kritik kalem | Dişli Çark Z-24 · 30/75 | Mock satır 3 | PASS |
| Müşteri bağlam | Rulman A.Ş. | Rulman A.Ş. | PASS |
| Tahmini teslimat | 18.06.2025 | 18.06.2025 | PASS |
| Toplam tutar | ₺11.515,00 | ₺11.515,00 | PASS |
| Stepper aktif adım | Adım 1 ✓ · içerik Stok Onayı | Adım 2 `current` | FAIL |

---

## 4. Fark listesi (zorunlu, min 1 satır)

1. **Stepper:** PNG’de adım 1 “Stok Onayı” tamamlanmış (✓), adım 2 numaralı bekliyor; gövde Stok Onayı. Mock `DONUSUM_STEPS` adım 2’yi `current: true` işaretliyor.
2. Stok tablosu 6 kalem (Hava Filtresi … Elektrik Motoru) PNG ile hizalı — PASS alanı.
3. Sağ panel Rulman A.Ş. ve ₺11.515,00 — PASS.
4. Geçerlilik 30.06.2025 — PASS.
5. Build ve scroll politikası — PASS.

---

## 5. Karar

- [ ] **PASS** → Director final sign-off için `qa-pass`
- [x] **FAIL** → REVIZE: `DONUSUM_STEPS` — adım 1 `done: true`, adım 2 `current: false` (PNG stepper)

**Auditor imzası:** PNG okundu; mock veri REVIZE hedefleri karşılandı; stepper tek kritik FAIL.
