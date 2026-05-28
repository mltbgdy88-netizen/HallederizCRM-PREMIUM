# Cursor görev standardı

Cursor; mimari, UI iskeleti, servis tasarımı, refactor planı ve dokümantasyonda kullanılır.

## Görev şablonu

```markdown
## Bağlam
[Ürün/mimari arka plan, ilgili kararlar]

## Hedef
[Ölçülebilir sonuç]

## Mevcut dosyaları inceleme listesi
- [README, spec, modül yolları]

## Mimari kararlar
- [korunacak / değişmeyecek sınırlar]

## Uygulama adımları
1. ...
2. ...

## Test ve doğrulama
- [komutlar, manuel kontrol]

## PR açıklaması
- [BRANCH_AND_PR_STANDARD.md bölümlerine kısa cevaplar]
```

## UI görevleri

- Kapsam: `apps/web`, gerekirse `packages/ui`.
- Backend/API/DB/worker/auth’a dokunma (açık istek yoksa).
- `ui-designer-rules.mdc` ve kabul edilmiş route’lar referans.

## Dokümantasyon görevleri

- Ürün kodu ve iş mantığı değiştirilmez; spec ile çelişki yoksa mevcut karar esas.

## Referans

- `.cursor/rules/00-project-context.mdc` … `09-pr-review-checklist.mdc`
- `docs/master-project-spec.md`, `docs/DECISIONS.md`
