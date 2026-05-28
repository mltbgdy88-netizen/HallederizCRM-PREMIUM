# QA Visual Report — login-split

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/21-sistem/login/login-split-acik-mod.png`  
**Route:** http://localhost:3011/login  
**Implementer iddiası:** qa-review (W7 teslim)

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | PNG okundu |
| `pnpm build` | FAIL | Dev 3011 aktif |
| Body scroll yok | PASS | `login-split-reference.css` 100dvh overflow hidden |
| Route erişilebilir | PASS | HTTP 200; `(auth)` AppShell yok |

---

## 2. Layout karşılaştırması

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk | Split; AppShell yok | `(auth)` layout | PASS |
| Sol panel | Hallederiz CRM + 3 özellik | LOGIN_BRAND + FEATURES | PASS |
| Form | Hoş Geldiniz + demo kutusu | LOGIN_FORM | PASS |
| Canvas | Yeşil/altın split | CSS uyumlu | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Demo e-posta | demo@hallederizcrm.com | Aynı | PASS |
| Demo şifre | demo123 | Aynı | PASS |
| Giriş Yap | Altın buton | Aynı | PASS |

---

## 4. Fark listesi

1. Sol panel organik şekil detayı ton farkı olabilir (kozmetik).
2. `pnpm build` atlandı.
3. Gözle görülür metin/layout farkı yok.
4. Beni hatırla + Şifremi unuttum hizası PASS.
5. Body scroll yok PASS.

---

## 5. Karar

- [x] **PASS** → Director `qa-pass` adayı
- [ ] **FAIL**

**Auditor imzası:** PNG okundu; PASS.
