# QA Visual Report — offline-api-state

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/21-sistem/offline-api/offline-api-state-acik-mod.png`  
**Route:** http://localhost:3011/offline  
**Implementer iddiası:** qa-review (W7 teslim)

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | PNG okundu |
| `pnpm build` | FAIL | Dev 3011 aktif |
| Body scroll yok | PASS | state sayfası overflow hidden |
| Route erişilebilir | PASS | HTTP 200 |

---

## 2. Layout karşılaştırması

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk | Alternatif minimal CRM sidebar | **Premium AppShell** (operasyon menüsü) | FAIL |
| Merkez kart | API Bağlantısı Yok + OFFLINE MOD | OFFLINE_STATE metinleri | PASS |
| Alt banner | Bağlantı Sorunu + kontrol butonu | banner + bannerAction | PASS |
| Header | Gösterge Paneli başlık | AppShell header (Arama yapın…) | FAIL |
| Canvas | Açık kart | Uyumlu | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Başlık | API Bağlantısı Yok | Aynı | PASS |
| Badge | OFFLINE MOD | Aynı | PASS |
| Yeniden Dene | Var | Var | PASS |
| Sidebar alt | ÇEVRİMDIŞI MOD | AppShell’de yok | FAIL |

---

## 4. Fark listesi

1. Referans PNG **farklı kabuk** (Müşteriler/Fırsatlar menüsü); uygulama standart operasyon AppShell kullanıyor — REVIZE blocker.
2. Referansta sidebar alt “ÇEVRİMDIŞI MOD” şeridi yok.
3. Merkez kart metinleri PNG ile uyumlu (PASS).
4. `pnpm build` atlandı.
5. Body scroll yok (PASS).

---

## 5. Karar

- [ ] **PASS**
- [x] **FAIL** → REVIZE; `/offline` kabuğu PNG’deki offline shell veya PNG güncellemesi; sidebar offline göstergesi

**Auditor imzası:** PNG okundu; FAIL (kabuk drift).
