# QA Visual Report — kullanicilar-operasyon-masasi

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/12-kullanicilar/liste/kullanicilar-operasyon-masasi-acik-mod.png`  
**Route:** http://localhost:3011/kullanicilar  
**Implementer iddiası:** qa-review (W6 teslim)

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | PNG okundu |
| `pnpm build` | FAIL | Dev 3011 aktif |
| Body scroll yok | PASS | `.kum-home { overflow: hidden }` |
| Route erişilebilir | PASS | HTTP 200 |

---

## 2. Layout karşılaştırması

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk | Ayarlar > Kullanıcılar aktif | AppShell | PASS |
| Başlık / alt | “rollerini ve yetkilerini düzenleyin” | “yetkilendirmelerini yönetin” | FAIL |
| KPI şeridi | Aktif 5, Pasif 1 | Aktif 22, Pasif 1 | FAIL |
| Ana grid | Tablo + Kullanıcı Bağlamı | İki sütun | PASS |
| Tablo | 10 satır; Burcu Güneş Pasif | 6 satır; farklı isimler | FAIL |
| Sağ panel | Yusuf; oluşturma 10.01.2025 | oluşturma 15.01.2024 | FAIL |
| Canvas | Açık gri | Uyumlu | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Toplam Kullanıcı | 24 | 24 | PASS |
| Aktif Kullanıcı | 5 | 22 | FAIL |
| Filtre placeholder | ad, e-posta, rol | Kullanıcı ara... | FAIL |
| Yusuf son giriş | 23.05.2025 14:35 | 27.05.2025 09:15 | FAIL |
| Yetki özeti Tam Erişim | 120 | 120 | PASS |

---

## 4. Fark listesi

1. KPI “Aktif Kullanıcı” PNG 5 — mock 22 (kritik drift).
2. Tablo kullanıcı listesi PNG’deki 10 satırla eşleşmiyor (Burcu Güneş Pasif yok).
3. Alt başlık ve arama placeholder PNG metni değil.
4. Bağlam paneli oluşturma tarihi 10.01.2025 olmalı.
5. `pnpm build` atlandı (dev açık).

---

## 5. Karar

- [ ] **PASS**
- [x] **FAIL** → REVIZE; `kullanicilar-operasyon-mock.ts` `KUM_KPIS` + `KUM_TABLE_ROWS` + `getKumContext` PNG bire bir

**Auditor imzası:** PNG okundu; FAIL.
