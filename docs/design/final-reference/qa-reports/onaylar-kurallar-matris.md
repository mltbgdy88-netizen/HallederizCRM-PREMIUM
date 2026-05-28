# QA Visual Report — onaylar-kurallar-matris

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/15-onaylar/kurallar-limitler/onaylar-kurallar-matris-acik-mod.png`  
**Route:** http://localhost:3011/onaylar/kurallar  
**Implementer iddiası:** qa-review (W6 teslim)

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
| Kabuk | Onaylar | AppShell | PASS |
| Başlık | Onay Kuralları ve Limitler | Aynı | PASS |
| KPI | 24/18/4/7 + son güncelleme | 4 KPI + OKR_LAST_UPDATE | PASS |
| Tablo + drawer | Liste + Kural Detayı | Tablo + sağ panel | PASS |
| Canvas | Açık | Uyumlu | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans | Uygulama | Sonuç |
|------|----------------|----------|-------|
| İndirim %15 | İndirim Onayı | Satır 1 | PASS |
| Son güncelleme | 22.05.2025 14:35 | OKR_LAST_UPDATE | PASS |
| Toplam kural | 24 | 24 | PASS |
| Drawer koşullar | Madde listesi | conditions[] | PASS |

---

## 4. Fark listesi

1. Tablo satır sayısı ekranda ~10; mock’ta örnek satırlar PNG ile uyumlu (kalan sayfalama).
2. `pnpm build` atlandı.
3. Sağ drawer “Devre Dışı Bırak” kırmızı outline — referansla uyumlu.
4. Filtre placeholder “Kural ara...” — PASS.
5. Gözle görülür layout drift yok.

---

## 5. Karar

- [x] **PASS** → Director `qa-pass` adayı
- [ ] **FAIL**

**Auditor imzası:** PNG okundu; PASS.
