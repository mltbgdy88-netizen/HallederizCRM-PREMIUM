"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../../src/providers/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { state, login } = useAuth();
  const [tenantSlug, setTenantSlug] = useState("hallederiz");
  const [email, setEmail] = useState("admin@hallederiz.com");
  const [password, setPassword] = useState("demo");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (state === "authenticated") {
      router.replace("/");
    }
  }, [router, state]);

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
      setErrorMessage(result.message ?? "Giriş yapılamadı.");
      return;
    }

    router.replace("/");
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
