# WA Clean Reuse Map

## 1. Amac

Bu dokuman, eski `mltbgdy88-netizen/hallederizcrm-wa-clean` reposundaki degerli parcalarin `HallederizCRM-PREMIUM` monoreposuna nasil referans olacagini tanimlar.

Eski repo ana urun degildir. Yeni urun `HallederizCRM-PREMIUM` olarak devam eder. Eski repo, guvenlik, WhatsApp workflow, lokal AI ve smoke test pratikleri icin kaynak olarak kullanilir.

## 2. Tasinacak Degerli Parcalar

| Eski repo parcasi | Yeni projedeki hedef | Not |
|---|---|---|
| `src/lib/whatsapp/webhook-security.ts` | API shared webhook security | Signature, verify token ve replay koruma referansi |
| `src/lib/whatsapp/rule-resolver.ts` | Domain WhatsApp rule policy | Intent, izin, risk ve fallback karar modeli |
| `src/lib/whatsapp/workflow-store.ts` | API WhatsApp workflow repository / idempotency | Request idempotency ve workflow state saklama referansi |
| `src/lib/whatsapp/workflow-engine.ts` | Domain/service workflow reference | WhatsApp action request -> workflow karari |
| `src/app/api/whatsapp/inbound/route.ts` | Fastify route design reference | Next API route birebir tasinmaz; request/response mantigi referans alinir |
| `local-ai-backend/*` | `apps/local-ai-service` | Lokal AI backend portu icin servis referansi |
| `src/lib/ai-content/engine.ts` | Domain AI content policy | AI icerik, risk ve onayli operator davranisi |
| `src/lib/auth/session.ts` | Auth hardening reference | Session cozumleme ve current user baglami |
| `src/lib/auth/guard.ts` | Auth hardening reference | Protected route / endpoint guard yaklasimi |
| `src/lib/auth/authorization.ts` | Auth hardening reference | Role/permission karar mantigi |
| `src/lib/auth/middleware.ts` | Auth hardening reference | Request boundary ve tenant/user context |
| `.github/workflows/smoke-gate.yml` | Monorepo CI reference | Typecheck, lint, smoke ve Playwright gate modeli |
| `tests/smoke/*` | Playwright smoke scenario reference | Kritik route ve kullanici akisi smoke referansi |
| `src/components/hizli-satis/HizliSatisTerminalView.tsx` | Quick Operation UX reference | Klasik fis hissi + modern CRM workflow fikri |

## 3. Birebir Tasinmayacaklar

- Old `AppState` / reducer / localStorage-first state model
- Old Next.js API route structure
- Old UI files as-is
- `whatsapp-web.js` as production backbone
- Snapshot persistence as main persistence model

## 4. Port Etme Kurallari

- Once kontrat ve test yazilir, sonra port edilir.
- Yeni monorepo katmanlari korunur:
  - `apps/api`
  - `apps/web`
  - `apps/local-agent`
  - `packages/domain`
  - `packages/sdk`
  - `packages/types`
- Eski UI sadece urun/akıs referansi olarak kullanilir; mevcut premium tasarim sistemine uyarlanir.
- Eski persistence yaklasimi kalici kaynak olarak alinmaz; PostgreSQL ve repository pattern hedeflenir.

## 5. Ilk PR Adaylari

1. WhatsApp webhook security helper kontrati
2. WhatsApp rule resolver domain policy
3. Workflow idempotency store kontrati
4. Auth/session guard hardening notlari
5. Local AI backend port analizi
6. Quick Operation Center UX foundation
