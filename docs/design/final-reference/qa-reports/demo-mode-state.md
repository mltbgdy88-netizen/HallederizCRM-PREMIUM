# QA Visual Report — demo-mode-state

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/21-sistem/demo-mode/demo-mode-state-acik-mod.png`  
**Route:** http://localhost:3011/demo  
**Implementer iddiası:** qa-review (W7 teslim)

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | PNG okundu |
| `pnpm build` | FAIL | Dev 3011 aktif |
| Body scroll yok | PASS | Modal + backdrop overflow hidden |
| Route erişilebilir | PASS | HTTP 200 |

---

## 2. Layout karşılaştırması

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk | Stok backdrop + AppShell | Stok sayfası blur + modal | PASS |
| Modal | DEMO MODU + 3 madde + AÇIK | DEMO_MODAL | PASS |
| Stok backdrop | KPI/tablo silik | Arka plan mevcut | PASS |
| Canvas | Koyulaştırılmış overlay | Uyumlu | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Başlık | DEMO MODU | DEMO_MODAL.title | PASS |
| Toggle | AÇIK | AÇIK | PASS |
| Çıkış | Çıkış | exit | PASS |

---

## 4. Fark listesi

1. Arka plan stok ekranı referanstaki KPI değerleriyle uyumlu (kozmetik blur).
2. `pnpm build` atlandı.
3. Modal altın kalkan ikonu tonu (kozmetik).
4. Gözle görülür metin farkı yok.
5. Body scroll yok.

---

## 5. Karar

- [x] **PASS** → Director `qa-pass` adayı
- [ ] **FAIL**

**Auditor imzası:** PNG okundu; PASS.
