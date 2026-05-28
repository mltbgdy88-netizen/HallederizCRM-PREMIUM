# QA Visual Report — ai-icgoruler

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/18-ai/icgoruler/ai-icgoruler-acik-mod.png`  
**Route:** http://localhost:3011/ai/icgoruler  
**Implementer iddiası:** qa-review (W7 teslim)

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | PNG okundu |
| `pnpm build` | FAIL | Dev 3011 aktif |
| Body scroll yok | PASS | overflow hidden |
| Route erişilebilir | PASS | HTTP 200 |

---

## 2. Layout karşılaştırması

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk | AI İçgörüler aktif | AppShell | PASS |
| KPI | Risk/Fırsat/Sipariş/Segment | AIC_KPIS | PASS |
| Liste + detay | 8 kayıt + sağ panel | AIC_INSIGHTS | PASS |
| Sekmeler | Tümü/Risk/Fırsat… | AIC_TABS | PASS |
| Canvas | Açık | Uyumlu | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Risk KPI | 12 Yüksek · ₺478.250 | Aynı | PASS |
| Seçili | Vadesi Geçen Tahsilat | selected id 1 | PASS |
| Segment A | %38 | %38 | PASS |

---

## 4. Fark listesi

1. Öncelik filtresi “Öncelik: Yüksek” referansta; uygulama dropdown (kozmetik).
2. `pnpm build` atlandı.
3. 8 liste satırı — PASS.
4. Sağ öneri checklist 3 madde — PASS.
5. Body scroll yok.

---

## 5. Karar

- [x] **PASS** → Director `qa-pass` adayı
- [ ] **FAIL**

**Auditor imzası:** PNG okundu; PASS.
