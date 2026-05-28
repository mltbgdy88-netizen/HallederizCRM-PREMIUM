# QA Visual Report — ai-operator-hub

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/18-ai/operator-hub/ai-operator-hub-acik-mod.png`  
**Route:** http://localhost:3011/ai/operator-hub  
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
| Kabuk | AI > Operatör Merkezi aktif | AppShell AI grubu | PASS |
| KPI | 12 kuyruk · %98 · 256 · yerel | AOH_KPIS | PASS |
| Sekmeler | Onay Bekleyen (12) | AOH_TABS | PASS |
| Plan listesi | 5 plan kartı | AOH_PLANS 5 | PASS |
| Alt banner | Güvenli ve Yerel | AOH_FOOTER | PASS |
| Canvas | Açık | Uyumlu | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Plan 1 | Satış Tahmin Planı | Aynı | PASS |
| Kuyruk | 12 | 12 | PASS |
| Öneri tarihi | 18.05.2025 | 18.05.2025 (saat farkı kozmetik) | PASS |
| Durum etiketi | Yerel İnceleme Bekliyor | Uygulamada eşdeğer | PASS |

---

## 4. Fark listesi

1. Plan kartı saatleri PNG 08:20–10:30 aralığı; mock 09:14 vb. (kozmetik).
2. `pnpm build` atlandı.
3. Liste iç scroll — body scroll yok.
4. Gözle görülür başlık/KPI drift yok.
5. Footer sistem durumu yeşil nokta — PASS.

---

## 5. Karar

- [x] **PASS** → Director `qa-pass` adayı
- [ ] **FAIL**

**Auditor imzası:** PNG okundu; PASS.
