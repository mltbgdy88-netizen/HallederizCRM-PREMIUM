"use client";

import { UiButton } from "@hallederiz/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useAuth } from "../../src/providers/auth-provider";

function resolvePostLoginPath(nextParam: string | null): string {
  if (!nextParam) {
    return "/";
  }
  if (!nextParam.startsWith("/") || nextParam.startsWith("//")) {
    return "/";
  }
  return nextParam;
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, login } = useAuth();
  const [tenantSlug, setTenantSlug] = useState("hallederiz");
  const [email, setEmail] = useState("admin@hallederiz.com");
  const [password, setPassword] = useState("demo");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; tenant?: string }>({});

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

    const result = await login({
      tenantSlug,
      email,
      password
    });

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.message ?? "Oturum bulunamadı. Lütfen tekrar giriş yapın.");
      return;
    }

    router.replace(resolvePostLoginPath(searchParams.get("next")));
  }

  return (
    <main className="hz-login-page">
      <section className="hz-login-brand" aria-label="Kurumsal bilgi">
        <p className="hz-login-brand-eyebrow">HallederizCRM PREMIUM</p>
        <h1>İç operasyon platformu</h1>
        <p className="hz-login-brand-lead">
          Onay, hızlı işlem ve günlük operasyon akışlarını tek güvenli oturumla yönetin.
        </p>
        <ul className="hz-login-brand-points">
          <li>Çok kiracılı kurumsal erişim</li>
          <li>İnsan onaylı işlem modeli</li>
          <li>Denetlenebilir operasyon geçmişi</li>
        </ul>
      </section>

      <section className="hz-login-form-panel">
        <div className="hz-login-card">
          <h2>Platform girişi</h2>
          <p className="hz-login-card-lead">Kurumsal CRM platformuna giriş yapın.</p>

          <form className="hz-login-form" onSubmit={handleSubmit} noValidate>
            <div className="hz-login-field">
              <label htmlFor="login-tenant">
                Kiracı kodu
                <input
                  id="login-tenant"
                  name="tenant"
                  autoComplete="organization"
                  value={tenantSlug}
                  onChange={(event) => setTenantSlug(event.target.value)}
                  aria-invalid={fieldErrors.tenant ? true : undefined}
                  aria-describedby={fieldErrors.tenant ? "login-tenant-error" : undefined}
                />
              </label>
              {fieldErrors.tenant ? (
                <p id="login-tenant-error" className="hz-login-error" role="alert">
                  {fieldErrors.tenant}
                </p>
              ) : null}
            </div>

            <div className="hz-login-field">
              <label htmlFor="login-email">
                E-posta
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={fieldErrors.email ? true : undefined}
                  aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
                />
              </label>
              {fieldErrors.email ? (
                <p id="login-email-error" className="hz-login-error" role="alert">
                  {fieldErrors.email}
                </p>
              ) : null}
            </div>

            <div className="hz-login-field">
              <label htmlFor="login-password">
                Şifre
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={fieldErrors.password ? true : undefined}
                  aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
                />
              </label>
              {fieldErrors.password ? (
                <p id="login-password-error" className="hz-login-error" role="alert">
                  {fieldErrors.password}
                </p>
              ) : null}
            </div>

            {errorMessage ? (
              <p className="hz-login-error" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <UiButton type="submit" className="hz-login-submit" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting ? "Giriş yapılıyor…" : "Giriş yap"}
            </UiButton>
          </form>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="hz-login-page">
          <section className="hz-login-form-panel">
            <div className="hz-login-loading-card">
              <p>Oturum bilgileri kontrol ediliyor…</p>
            </div>
          </section>
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
