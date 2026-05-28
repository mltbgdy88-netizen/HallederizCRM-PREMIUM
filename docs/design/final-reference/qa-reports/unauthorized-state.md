# QA Visual Report — unauthorized-state

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/21-sistem/unauthorized/unauthorized-state-acik-mod.png`  
**Route:** http://localhost:3011/unauthorized  
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
| Kabuk | Premium AppShell | AppShell | PASS |
| Merkez kart | Kilit + Yetkiniz Yok | UNAUTHORIZED_STATE | PASS |
| Butonlar | Geri Dön / Ana Sayfa | Aynı | PASS |
| Canvas | Krem arka plan | Uyumlu | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Başlık | Yetkiniz Yok | Aynı | PASS |
| Açıklama | erişim yetkiniz bulunmamaktadır | Aynı | PASS |

---

## 4. Fark listesi

1. Kilit ikon daire tonu (kozmetik).
2. `pnpm build` atlandı.
3. Gözle görülür metin farkı yok.
4. Body scroll yok.
5. v2.6.1 footer sidebar’da PASS.

---

## 5. Karar

- [x] **PASS** → Director `qa-pass` adayı
- [ ] **FAIL**

**Auditor imzası:** PNG okundu; PASS.
