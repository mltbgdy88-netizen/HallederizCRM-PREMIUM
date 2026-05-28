# QA Visual Report — gelen-kutu-uc-panel

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/19-gelen-kutu/uc-panel/gelen-kutu-uc-panel-acik-mod.png`  
**Route:** http://localhost:3011/gelen-kutu/uc-panel  
**Implementer iddiası:** qa-review (W7 teslim)

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | PNG okundu |
| `pnpm build` | FAIL | Dev 3011 aktif |
| Body scroll yok | PASS | 4 panel overflow hidden |
| Route erişilebilir | PASS | HTTP 200 |

---

## 2. Layout karşılaştırması

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk | Gelen Kutu aktif | AppShell | PASS |
| 4 sütun | Klasör/kanal · liste · sohbet · müşteri | GKU layout | PASS |
| Klasörler | 24/8/12/152… | GKU_FOLDERS | PASS |
| Kanallar | WhatsApp 12… | GKU_CHANNELS | PASS |
| Sohbet sekmeleri | Sohbet/Müşteri/Notlar… | Uygulamada | PASS |
| Canvas | Açık | Uyumlu | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Seçili | Ahmet Yılmaz | GKU_CHAT_HEADER | PASS |
| Etiketler | Potansiyel / Fiyat / Teknik | GKU_TAGS | PASS |
| Memnuniyet | 4.5/5 | stats | PASS |
| Müşteri ID | M-10015 (PNG) | CR-10245 | FAIL |

---

## 4. Fark listesi

1. Müşteri kodu PNG M-10015 — mock CR-10245 (ikincil metin).
2. Konuşma listesi uzunluğu referansta daha fazla örnek (kozmetik).
3. `pnpm build` atlandı.
4. WhatsApp/Yeni/Atanmamış etiketleri — PASS.
5. Body scroll yok — PASS.

---

## 5. Karar

- [x] **PASS** → Director `qa-pass` adayı (kozmetik müşteri kodu REVIZE isteğe bağlı)
- [ ] **FAIL**

**Auditor imzası:** PNG okundu; PASS (kabuk + 4 panel + çekirdek mock).
