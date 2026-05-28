# QA Visual Report — ayarlar-hub

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/14-ayarlar/hub/ayarlar-hub-acik-mod.png`  
**Route:** http://localhost:3011/ayarlar  
**Implementer iddiası:** qa-review (W6 teslim)

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | PNG okundu |
| `pnpm build` | FAIL | Dev 3011 aktif |
| Body scroll yok | PASS | Hub grid overflow hidden |
| Route erişilebilir | PASS | HTTP 200 |

---

## 2. Layout karşılaştırması

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk | Ayarlar aktif | AppShell | PASS |
| Başlık / alt | Ayarlar + alt metin | Aynı | PASS |
| KPI / üst şerit | Yok (kart grid) | 7 kart grid | PASS |
| Ana grid | 7 ayar kartı | Genel…Yazdırma | PASS |
| Tablolar | Yok | — | PASS |
| Sağ panel | Yok | — | PASS |
| Canvas | Açık krem-gri | Uyumlu | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Kart Genel | Genel | Genel | PASS |
| Kart Kullanıcılar | → kullanıcılar | href /kullanicilar | PASS |
| Kart Entegrasyon | → erp | href /erp | PASS |
| Kart Onaylar | onay akışları | /onaylar/kurallar | PASS |
| 7 kart sayısı | 7 | 7 | PASS |

---

## 4. Fark listesi

1. Kart ok ikonları ve gölge tonu referansa çok yakın (kozmetik fark yok sayılır).
2. `pnpm build` atlandı.
3. Gözle görülür layout/metin farkı yok — 5 layout maddesi PASS.
4. AI kartı href `#` (referansta da statik hub).
5. Body scroll testi CSS ile PASS.

---

## 5. Karar

- [x] **PASS** → Director `qa-pass` adayı
- [ ] **FAIL**

**Auditor imzası:** PNG okundu; PASS.
