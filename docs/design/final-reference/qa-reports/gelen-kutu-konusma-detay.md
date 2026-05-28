# QA Visual Report — gelen-kutu-konusma-detay

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/19-gelen-kutu/konusma-detay/gelen-kutu-konusma-detay-acik-mod.png`  
**Route:** http://localhost:3011/gelen-kutu/konusma  
**Implementer iddiası:** qa-review (W7 teslim)

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | PNG okundu |
| `pnpm build` | FAIL | Dev 3011 aktif |
| Body scroll yok | PASS | 3 panel overflow hidden |
| Route erişilebilir | PASS | HTTP 200 |

---

## 2. Layout karşılaştırması

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk | Gelen Kutu aktif | AppShell | PASS |
| 3 sütun | Liste / sohbet / bağlam | 3 sütun | PASS |
| Liste | 8 konuşma | 3 thread | FAIL |
| Sohbet | UR-10001 Müşteri | GKK_ACTIVE | PASS |
| Sağ panel | 6 hızlı işlem + etkileşimler | GKK_QUICK | PASS |
| Canvas | Açık | Uyumlu | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Ürün | UR-10001 Rulman | Aynı | PASS |
| Stok yanıtı | 850 adet (PNG) | 2.450 adet | FAIL |
| Fiyat | ₺85,00 | ₺85,00 | PASS |
| Etkileşim | Sipariş/Teklif/Fatura | 2 kayıt (Fatura yok) | FAIL |

---

## 4. Fark listesi

1. Sol liste 8 konuşma — mock `GKK_THREADS` yalnızca 3.
2. Agent stok cevabı PNG “850 adet”; mock “2.450 adet”.
3. Son etkileşimlerde Fatura satırı referansta; mock eksik.
4. `pnpm build` atlandı.
5. Panel oranları genel olarak referansa yakın (layout PASS).

---

## 5. Karar

- [ ] **PASS**
- [x] **FAIL** → REVIZE; `gelen-kutu-konusma-mock.ts` thread listesi + `GKK_MESSAGES` stok metni + `GKK_INTERACTIONS` PNG

**Auditor imzası:** PNG okundu; FAIL.
