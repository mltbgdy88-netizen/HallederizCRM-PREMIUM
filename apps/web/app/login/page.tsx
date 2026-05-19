"use client";

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

  useEffect(() => {
    if (state === "authenticated") {
      router.replace(resolvePostLoginPath(searchParams.get("next")));
    }
  }, [router, searchParams, state]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
    <main className="login-page">
      <section className="login-card">
        <p className="eyebrow">HallederizCRM PREMIUM</p>
        <h1>Platform Giriş</h1>
        <p className="muted">Kurumsal CRM platformuna giriş yapın.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Kiracı
            <input value={tenantSlug} onChange={(event) => setTenantSlug(event.target.value)} />
          </label>

          <label>
            E-Posta
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>

          <label>
            Parola
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>

          {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="login-page">
          <section className="login-card">
            <p className="muted">Oturum bilgileri kontrol ediliyor.</p>
          </section>
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
