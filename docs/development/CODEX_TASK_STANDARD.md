# Codex görev standardı

Codex’e verilen işler tek satırlık düzeltme değil; test edilebilir, sınırlı paketler olmalıdır.

## Görev şablonu

```markdown
## Görev adı
[Kısa başlık]

## Amaç
[1–3 cümle]

## Dokunulabilecek dosyalar
- [yol listesi veya glob]

## Dokunulmaması gereken dosyalar
- [yol listesi]

## Korunacak mevcut davranışlar
- [regresyon yasağı listesi]

## Beklenen çıktı
- [somut deliverable]

## Test komutları
- pnpm typecheck
- pnpm --filter @hallederiz/api test
- [ilgili smoke/integration]

## Kabul kriterleri
- [ölçülebilir maddeler]

## Geri alma notu
- [revert / flag / migration down]
```

## Paketleme

- Tek PR = tek ana risk teması (ör. webhook idempotency, approval dispatcher).
- UI + migration + auth aynı pakette birleştirilmez (istisna: açık kullanıcı onayı).
- Belirsizlikte fail-closed ve insan onayı seçilir.

## Yasaklar

- Tenant bypass, approval bypass, raw webhook token loglama.
- Sessiz mock ile production mutation başarısı.
- Test yazılmadan kritik guard değişikliği “bitti” demek.

## Referans

- `.cursor/rules/08-codex-task-rules.mdc`
- `AI_SAFETY_AND_APPROVAL_RULES.md`
