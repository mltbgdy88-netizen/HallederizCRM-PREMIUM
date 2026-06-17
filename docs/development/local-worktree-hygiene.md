# Yerel Worktree Hijyeni

Bu belge geliştirici ortamında commit dışı kalması gereken dosyaları, test öncesi env temizliğini ve Cursor “too many active changes” uyarısını önlemek için çalışma standardını tanımlar.

**Son doğrulama:** main `930ac2e`

---

## 1. Commit’e alınmaması gerekenler

| Öğe | Örnek | Neden |
|-----|--------|--------|
| Ortam dosyaları | `.env`, `.env.local`, `apps/web/.env.local` | Secret / yerel config |
| Build çıktıları | `dist/`, `.next/`, `.runtime-next-dev/`, `*.tsbuildinfo` | Generated |
| Bağımlılıklar | `node_modules/`, `.pnpm-store/` | Yeniden üretilebilir |
| Python venv | `apps/local-ai-service/.venv/` | Yerel runtime |
| Geçici extract | `.tmp-*` (ör. `.tmp-cariler-extract/`) | Agent/araç çıktısı |
| Artefakt klasörleri | `artifacts/` | CI veya lokal dump |
| Zip arşivleri | `hallederizcrm final.zip`, `docs/design/export/*.zip` | Büyük binary |
| Next tip stub | `apps/web/next-env.d.ts` | `next dev` / build sonrası değişebilir |

### `next-env.d.ts`

Next.js bu dosyayı otomatik günceller. `git status`’ta görünürse:

```bash
git checkout -- apps/web/next-env.d.ts
```

Commit’e almayın. `.gitignore`’a eklenmesi ayrı chore PR konusudur.

### `.tmp-*` ve `artifacts/`

Şu an `.gitignore`’da olmayabilir. Untracked bırakın; commit’e eklemeyin. İsteğe bağlı temizlik:

```powershell
Remove-Item -Recurse -Force .tmp-*, artifacts -ErrorAction SilentlyContinue
```

---

## 2. Test / gate öncesi env temizliği

Yanlış `DATABASE_URL` veya `PERSISTENCE_MODE` test sonuçlarını kirletir.

### Kontrol listesi

```powershell
# PowerShell — değerleri yazdırmadan varlık kontrolü
@('DATABASE_URL','POSTGRES_URL','PERSISTENCE_MODE','NODE_ENV') | ForEach-Object {
  if (Test-Path "Env:$_") { "$_ is set" } else { "$_ is unset" }
}
```

### Önerilen yerel test profili

| Değişken | API test (`pnpm test`) | Web dev |
|----------|------------------------|---------|
| `NODE_ENV` | `test` veya unset (script set eder) | `development` |
| `PERSISTENCE_MODE` | unset veya `memory` / demo | `demo` veya postgres (bilinçli) |
| `DATABASE_URL` | Postgres testleri için gerekli; yoksa ilgili testler skip | Docker postgres ile eşleşmeli |
| `POSTGRES_URL` | `DATABASE_URL` ile çakışmayın | Tek kanonik URL kullanın |

### Temiz oturum (API test kirlenmesi)

Yeni terminal açın veya:

```powershell
Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
Remove-Item Env:POSTGRES_URL -ErrorAction SilentlyContinue
Remove-Item Env:PERSISTENCE_MODE -ErrorAction SilentlyContinue
```

Ardından proje script’leri ile test çalıştırın (`pnpm test`). Postgres integration testleri kendi harness’inde URL set eder.

### Web dev

`apps/web/.env.local` örneği (commit edilmez):

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4001
NEXT_PUBLIC_ENABLE_DEMO_AUTH=true
```

API için `apps/api/.env` veya kök `.env` — demo auth ve port tutarlı olmalı.

---

## 3. Branch ve stage disiplini

1. `git checkout main && git pull origin main`
2. Feature branch: `feature/<scope>-<short-name>` veya `docs/<topic>`
3. Stage yalnızca görev dosyaları: `git add <paths>`
4. `git diff --name-status` ile kapsamı doğrula
5. `apps/web/tsconfig.tsbuildinfo` stage’deyse çıkar:

```bash
git checkout -- apps/web/tsconfig.tsbuildinfo
```

---

## 4. Cursor “too many active changes”

**Neden:** Çok sayıda untracked `.tmp-*`, zip, `.venv`, `artifacts/`.

**Çözüm:**

1. Untracked gürültüyü silin veya workspace dışına taşıyın.
2. Sadece aktif feature dosyalarını açık tutun.
3. Büyük zip/export dosyalarını repo kökünde tutmayın.
4. `git status --short` ile untracked sayısını izleyin; 20+ untracked ise temizlik yapın.

---

## 5. Paralel ajan / çoklu branch

- Aynı dosyaya iki ajan dokunmaz.
- Docs ajanı yalnızca `docs/**`.
- UI ajanı `apps/web/**` (atanmış feature).
- Merge sırası: bağımlı işler önceki PR main’deyken başlar.

---

## 6. Gate öncesi minimum komut seti

```bash
git checkout main
git pull origin main
pnpm smoke:navigation
pnpm smoke:routes
pnpm test
pnpm lint
pnpm security:audit
pnpm security:audit:report
```

UI işi sonrası ek:

```bash
pnpm --filter @hallederiz/web typecheck
pnpm --filter @hallederiz/ui typecheck
```

---

## 7. Hızlı teşhis

| Belirti | Olası neden | Aksiyon |
|---------|-------------|---------|
| Login 404 | Yanlış API port / container | `NEXT_PUBLIC_API_BASE_URL`, docker ps |
| Test flaky postgres | Eski `DATABASE_URL` shell’de | Env temizle, yeni terminal |
| `next-env.d.ts` modified | Normal dev | checkout -- |
| 4000 port meşgul | Başka servis | API’yi 4001’de çalıştır veya portu boşalt |
| Web ENOENT `.runtime-next-dev` | Bozuk cache | `pnpm --filter @hallederiz/web dev:clean` |

---

## Final karar

**DEV_ENV_DOCS_READY**

## Local generated artifacts

- Python cache files such as __pycache__/, *.pyc, and *.pyo must not be committed.
- Local AI virtual environments such as apps/local-ai-service/.venv/ must remain local.
- Temporary extraction folders such as .tmp-* must not be committed.
- Build/artifact folders such as artifacts/ must not be committed.
- ZIP exports and local archive files must not be committed.
- TypeScript build info files such as *.tsbuildinfo must not be committed.
- The local AI model binary apps/local-ai-service/assets/tr_TR-dfki-medium.onnx remains ignored and is downloaded locally when needed.
