# QA Visual Report — teklifler-yeni-hub

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/01-teklifler/yeni/teklifler-yeni-hub-acik-mod.png`  
**Route:** http://localhost:3011/teklifler/yeni  
**Implementer iddiası:** pass (REVIZE batch)  
**Re-QA (2026-05-27):** Post-REVIZE — `TYH_DRAFTS` 3 kart PNG ile hizalı.

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | `teklifler-yeni-hub-acik-mod.png` okundu |
| `pnpm build` | PASS | `pnpm stop-dev` → `pnpm build` |
| Body scroll yok | PASS | `.tyh-home { overflow: hidden }` |
| Route erişilebilir | PASS | `/teklifler/yeni` build çıktısında |

---

## 2. Layout karşılaştırması (referans ↔ uygulama)

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk (sidebar/header) | Teklifler aktif | AppShell | PASS |
| Başlık / alt başlık | Yeni Teklif Oluştur + alt metin | `TYH_PAGE` | PASS |
| Ana grid | Hub + 2 seçenek + taslaklar | Hızlı/Detaylı + `TYH_DRAFTS` | PASS |
| Tablolar / listeler | 3 taslak kartı | TEK-0047 / 0046 / 0045 | PASS |
| Renk / canvas tonu | Açık platform | Açık canvas | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans değer | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Taslak TEK-0047 | ABC Makina · 12.05 14:30 · ₺125.000 | Aynı | PASS |
| Taslak TEK-0046 | XYZ Otomotiv · 12.05 11:15 · ₺85.750 | Aynı | PASS |
| Taslak TEK-0045 | Mega İnşaat · 12.05 09:45 · ₺210.500 | Aynı | PASS |
| Hızlı / Detaylı açıklama | PNG metinleri | `TYH_OPTIONS` | PASS |
| İpucu şeridi | İpucu metni | `TYH_TIP` | PASS |

---

## 4. Fark listesi (zorunlu, min 1 satır)

1. Gözle görülür layout/metin farkı yok — 3 taslak kartı bire bir.
2. Hub iç alt başlık (`TYH_HUB.subtitle`) sayfa üstünden farklı; üst başlık PNG ile aynı (`TYH_PAGE.subtitle`).
3. Breadcrumb “Teklifler > Yeni Teklif” eşleşiyor.
4. Taslak “Taslak” badge altın ton (kozmetik).
5. Kart menü (⋯) POC — işlev yok, PNG’de var.

---

## 5. Karar

- [x] **PASS** → Director final sign-off için `qa-pass`
- [ ] **FAIL** → REVIZE

**Auditor imzası:** PNG okundu, `teklifler-yeni-mock.ts` bire bir doğrulandı, `pnpm build` PASS.
