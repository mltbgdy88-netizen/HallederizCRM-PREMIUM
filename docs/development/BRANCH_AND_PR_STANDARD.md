# Branch ve PR standardı

## Branch adları

| Önek | Kullanım |
|------|----------|
| `feature/<scope>-<short-name>` | Yeni özellik |
| `fix/<scope>-<short-name>` | Hata düzeltme |
| `refactor/<scope>-<short-name>` | Davranış koruyan yapısal düzenleme |
| `docs/<scope>-<short-name>` | Dokümantasyon |
| `hardening/<scope>-<short-name>` | Güvenlik / fail-closed / guard |
| `test/<scope>-<short-name>` | Test altyapısı veya kapsam |

`scope`: `api`, `web`, `domain`, `wa`, `ai`, `auth`, `worker`, `docs` vb.

## Commit mesajları

`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `hardening:`, `security:`

Örnek: `hardening: api whatsapp webhook fail-closed without secret`

## PR açıklaması (zorunlu bölümler)

1. **Amaç** — Neden?  
2. **Kapsam** — Ne değişti?  
3. **Kapsam dışı** — Bilinçli olarak yapılmayanlar  
4. **Etkilenen modüller**  
5. **Tenant / auth / permission etkisi**  
6. **AI / approval etkisi**  
7. **DB / migration etkisi**  
8. **Queue / worker etkisi**  
9. **Webhook / channel etkisi**  
10. **UI etkisi**  
11. **Test planı** — Komutlar + manuel adımlar  
12. **Riskler**  
13. **Rollback planı**  

Şablon: `.github/pull_request_template.md`

## Review kuralları

- Guard/tenant/approval/webhook değişikliği testsiz merge edilmez.
- Production auth veya signature fail-open gevşetmesi reddedilir.
- Migration PR’ları geri alma notu içermeli.
