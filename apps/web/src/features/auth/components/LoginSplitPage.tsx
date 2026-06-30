"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { isDemoAuthEnabled } from "../../ui-inventory/utils/login-command-center-data";
import { useAuth } from "../../../providers/auth-provider";

const REMEMBER_KEY = "hz_login_remember";

const BRAND_FEATURES = [
  {
    icon: "users" as const,
    title: "Müşteri Odaklı",
    detail: "Müşteri ilişkilerinizi tek noktadan yönetin."
  },
  {
    icon: "bar-chart-3" as const,
    title: "Verimliliği Artırın",
    detail: "Süreçlerinizi optimize edin, zaman kazanın."
  },
  {
    icon: "shield-check" as const,
    title: "Güvenli ve Kolay",
    detail: "Verileriniz güvende, erişiminiz her zaman kolay."
  }
];

function resolvePostLoginPath(nextParam: string | null): string {
  if (!nextParam) return "/dashboard";
  if (!nextParam.startsWith("/") || nextParam.startsWith("//")) return "/dashboard";
  return nextParam;
}

function readRemembered(): { tenantSlug: string; email: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(REMEMBER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { tenantSlug?: string; email?: string };
    if (!parsed.tenantSlug || !parsed.email) return null;
    return { tenantSlug: parsed.tenantSlug, email: parsed.email };
  } catch {
    return null;
  }
}

function LoginSplitInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, login } = useAuth();
  const demoAuth = isDemoAuthEnabled();

  const [tenantSlug, setTenantSlug] = useState("hallederiz");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; tenant?: string }>({});

  const demoEmail = process.env.NEXT_PUBLIC_DEMO_LOGIN_EMAIL ?? "demo@hallederizcrm.com";
  const demoPassword = process.env.NEXT_PUBLIC_DEMO_LOGIN_PASSWORD ?? "demo123";

  useEffect(() => {
    const remembered = readRemembered();
    if (remembered) {
      setTenantSlug(remembered.tenantSlug);
      setEmail(remembered.email);
      setRememberMe(true);
    } else if (demoAuth) {
      setEmail("admin@hallederiz.com");
      setPassword("demo");
    }
  }, [demoAuth]);

  useEffect(() => {
    if (state === "authenticated") {
      router.replace(resolvePostLoginPath(searchParams.get("next")));
    }
  }, [router, searchParams, state]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: { email?: string; password?: string; tenant?: string } = {};
    if (!tenantSlug.trim()) nextErrors.tenant = "Kiracı kodu gerekli.";
    if (!email.trim()) nextErrors.email = "E-posta gerekli.";
    if (!password.trim()) nextErrors.password = "Şifre gerekli.";
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await login({ tenantSlug: tenantSlug.trim(), email: email.trim(), password });
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.message ?? "Oturum bulunamadı. Lütfen tekrar giriş yapın.");
      return;
    }

    if (rememberMe) {
      window.localStorage.setItem(
        REMEMBER_KEY,
        JSON.stringify({ tenantSlug: tenantSlug.trim(), email: email.trim() })
      );
    } else {
      window.localStorage.removeItem(REMEMBER_KEY);
    }

    router.replace(resolvePostLoginPath(searchParams.get("next")));
  }

  return (
    <main className="hz-login-page" data-page="login-split">
      <aside className="hz-login-brand" aria-label="Hallederiz marka alanı">
        <div className="hz-login-brand__crest" aria-hidden>
          <span className="hz-login-brand__crest-mark">H</span>
        </div>
        <p className="hz-login-brand__title">
          Hallederiz <span className="hz-login-brand__title-accent">CRM</span>
        </p>
        <p className="hz-login-brand__tagline">İlişkilerinizi yönetin, başarınızı büyütün.</p>
        <ul className="hz-login-brand__features">
          {BRAND_FEATURES.map((feature) => (
            <li key={feature.title}>
              <span className="hz-login-brand__feature-icon" aria-hidden>
                <LucideIcon name={feature.icon} size={18} strokeWidth={2} />
              </span>
              <span>
                <strong>{feature.title}</strong>
                <span>{feature.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </aside>

      <section className="hz-login-form-panel">
        <div className="hz-login-card">
          <header className="hz-login-card__head">
            <h2>Hoş Geldiniz</h2>
            <p className="hz-login-card-lead">HallederizCRM hesabınıza giriş yapın.</p>
          </header>

          <form className="hz-login-form" onSubmit={handleSubmit} noValidate>
            <label className="hz-login-field" htmlFor="login-tenant">
              <span>Kiracı kodu</span>
              <input
                id="login-tenant"
                name="tenant"
                autoComplete="organization"
                value={tenantSlug}
                onChange={(e) => setTenantSlug(e.target.value)}
                aria-invalid={fieldErrors.tenant ? true : undefined}
                placeholder="hallederiz"
              />
              {fieldErrors.tenant ? (
                <span className="hz-login-field-error" role="alert">
                  {fieldErrors.tenant}
                </span>
              ) : null}
            </label>

            <label className="hz-login-field hz-login-field--icon" htmlFor="login-email">
              <span>E-posta</span>
              <span className="hz-login-input-wrap">
                <LucideIcon name="mail" size={16} className="hz-login-input-icon" aria-hidden />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={fieldErrors.email ? true : undefined}
                  placeholder="E-posta adresinizi girin"
                />
              </span>
              {fieldErrors.email ? (
                <span className="hz-login-field-error" role="alert">
                  {fieldErrors.email}
                </span>
              ) : null}
            </label>

            <label className="hz-login-field hz-login-field--icon" htmlFor="login-password">
              <span>Şifre</span>
              <span className="hz-login-input-wrap">
                <LucideIcon name="lock" size={16} className="hz-login-input-icon" aria-hidden />
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={fieldErrors.password ? true : undefined}
                  placeholder="Şifrenizi girin"
                />
              </span>
              {fieldErrors.password ? (
                <span className="hz-login-field-error" role="alert">
                  {fieldErrors.password}
                </span>
              ) : null}
            </label>

            {errorMessage ? (
              <p className="hz-login-error" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <div className="hz-login-form-row">
              <label className="hz-login-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Beni hatırla
              </label>
              <Link href="/ayarlar" className="hz-login-forgot">
                Şifremi unuttum
              </Link>
            </div>

            <button type="submit" className="hz-login-submit" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting ? "Giriş yapılıyor…" : "Giriş Yap"}
            </button>
          </form>

          {demoAuth ? (
            <>
              <p className="hz-login-divider">
                <span>veya</span>
              </p>
              <aside className="hz-login-demo" role="note">
                <LucideIcon name="info" size={16} aria-hidden />
                <div>
                  <strong>Demo erişim</strong>
                  <p>
                    E-posta: <code>{demoEmail}</code>
                  </p>
                  <p>
                    Şifre: <code>{demoPassword}</code>
                  </p>
                </div>
              </aside>
            </>
          ) : null}

          <p className="hz-login-operator-link">
            Hallederiz SaaS operatörü müsünüz? Giriş sonrası{" "}
            <Link href="/operator">SaaS Kontrol Paneli</Link>
            üzerinden kiracı ve yayın yönetimine erişin.
          </p>
        </div>
      </section>
    </main>
  );
}

export function LoginSplitPage() {
  return (
    <Suspense
      fallback={
        <main className="hz-login-page" role="status" aria-busy="true">
          <div className="hz-login-loading-card">Giriş ekranı yükleniyor…</div>
        </main>
      }
    >
      <LoginSplitInner />
    </Suspense>
  );
}
