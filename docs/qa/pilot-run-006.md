# Pilot Run 006 - Local Pilot Auth Smoke

- Tarih: 2026-04-30 15:20:50 +03:00
- Git commit (baslangic): `f6c7443`
- Kapsam: Local pilot auth provider aktivasyonu (development-only) ve authenticated quick-operation yolunun tekrar dogrulanmasi

## 1) Env ozeti (secret degerleri yazilmadan)

- `.env`: yok
- `.env.local`: var
- `.env.development`: yok

Var/yok kontrolu:

- `NODE_ENV`: var
- `DEMO_AUTH_ENABLED`: var
- `NEXT_PUBLIC_ENABLE_DEMO_AUTH`: var
- `PERSISTENCE_MODE`: var
- `ALLOW_DEMO_FALLBACK`: var
- `DATABASE_URL`: var
- `POSTGRES_URL`: var
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`: var
- `WHATSAPP_WEBHOOK_APP_SECRET`: var
- `AI_PROVIDER`: var
- `LOCAL_AI_SERVICE_URL`: var
- `LOCAL_AI_TIMEOUT_MS`: var
- `LOCAL_PILOT_AUTH_ENABLED`: yok
- `LOCAL_PILOT_AUTH_EMAIL`: yok
- `LOCAL_PILOT_AUTH_PASSWORD`: yok
- `LOCAL_PILOT_AUTH_ROLE`: yok

Not: Local pilot auth smoke'un runtime ortamda da calismasi icin yukaridaki 4 `LOCAL_PILOT_AUTH_*` anahtari `.env.local` icinde tanimlanmalidir.

## 2) Auth smoke sonucu

Asagidaki senaryolar API test suite ile dogrulandi:

- Production modda `LOCAL_PILOT_AUTH_ENABLED=true` olsa bile local pilot auth devre disi (guvenlik korunuyor)
- Development + postgres mod + local pilot auth kapali iken `/auth/login` 503 (mevcut policy korunuyor)
- Development + postgres mod + local pilot auth acik + dogru credential ile `/auth/login` 200
- Yanlis parola ile `/auth/login` 401
- Local pilot auth, `mock_access_*` token kabulunu acmiyor
- Local pilot auth, header permission fallback acmiyor

## 3) Authenticated quick-operation mini run durumu

- API testlerinde `quick-operations` protected endpointleri auth gerektiriyor (401 dogrulandi)
- Authenticated yol testleri (`sale_order`, `offer`, `payment`, `delivery`, `return`) gecti
- `submit` response'unda `workflowImpacts` ve `sideActions` alanlari testlerde dogrulandi

Sonuc: Local pilot auth provider kod seviyesinde hazir; `.env.local` icinde `LOCAL_PILOT_AUTH_*` alanlari tanimlandiginda pilot-run API seviyesinde authenticated mini run gercek ortamda da uygulanabilir.

## 4) Dogrulama komutlari

- `pnpm test`: PASS
- `pnpm typecheck`: PASS
- `pnpm build`: PASS
- `pnpm smoke:routes`: PASS
- `pnpm smoke:navigation`: PASS

## 5) Blocker / Warning

### Blocker
- Yok (kod/policy tarafinda)

### Warning
- Runtime pilot auth smoke'u elle calistirmak icin `.env.local` dosyasinda `LOCAL_PILOT_AUTH_*` alanlari henuz tanimli degil.

## 6) Sonuc

`PASS_WITH_WARNINGS`
