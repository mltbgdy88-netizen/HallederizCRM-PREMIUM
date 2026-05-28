"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuthLoginReferenceData } from "@/features/auth/hooks/use-auth-login-reference-data";
import { resolvePostLoginPath } from "@/features/auth/utils/resolve-post-login-path";
import { useAuth } from "@/providers/auth-provider";

function BrandShield() {
  return (
    <span className="lgn-shield" aria-hidden>
      <svg width={72} height={72} viewBox="0 0 96 96" fill="none">
        <path
          d="M48 8 16 22v24c0 18.2 12.8 35.2 32 41.8C67.2 81.2 80 64.2 80 46V22L48 8z"
          fill="url(#lgnShield)"
          stroke="#facc15"
          strokeWidth={2.5}
        />
        <text x="48" y="54" textAnchor="middle" fill="#064e3b" fontSize="28" fontWeight="800">
          H
        </text>
        <defs>
          <linearGradient id="lgnShield" x1="16" y1="8" x2="80" y2="88">
            <stop stopColor="#facc15" />
            <stop offset="1" stopColor="#ca8a04" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}

function FeatureIcon({ kind }: { kind: "users" | "chart" | "shield" }) {
  const props = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    "aria-hidden": true as const
  };
  if (kind === "chart") {
    return (
      <svg {...props}>
        <path d="M4 19V5M10 19V9M16 19v-6M22 19V3" />
      </svg>
    );
  }
  if (kind === "shield") {
    return (
      <svg {...props}>
        <path d="M12 3 4 7v6c0 5 4 9 8 10 4-1 8-5 8-10V7l-8-4z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3 19c0-3 3-5 6-5s6 2 6 5M14 19c0-2 2-3.5 4-3.5" />
    </svg>
  );
}

const FEATURE_ICONS = ["users", "chart", "shield"] as const;

export function LoginSplitPage() {
  const {
    data: { brand: LOGIN_BRAND, features: LOGIN_FEATURES, form: LOGIN_FORM }
  } = useAuthLoginReferenceData();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, login } = useAuth();
  const [email, setEmail] = useState(LOGIN_FORM.demoEmail);
  const [password, setPassword] = useState(LOGIN_FORM.demoPassword);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (state === "authenticated") {
      router.replace(resolvePostLoginPath(searchParams.get("next")));
    }
  }, [router, searchParams, state]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await login({
      email,
      password,
      tenantSlug: "premium-demo"
    });
    setSubmitting(false);
    if (!result.success) {
      setError(result.message ?? "Giriş başarısız.");
      return;
    }
    router.replace(resolvePostLoginPath(searchParams.get("next")));
  };

  if (state === "loading" || state === "authenticated") {
    return (
      <main className="lgn-split" role="status" aria-busy="true">
        <p className="lgn-form-head">Oturum kontrol ediliyor…</p>
      </main>
    );
  }

  return (
    <div className="lgn-split">
      <section className="lgn-split-brand" aria-label="Marka">
        <div className="lgn-split-brand-inner">
          <BrandShield />
          <h1 className="lgn-brand-title">
            {LOGIN_BRAND.title}
            <span>{LOGIN_BRAND.titleAccent}</span>
          </h1>
          <p className="lgn-brand-slogan">{LOGIN_BRAND.slogan}</p>
          <ul className="lgn-features">
            {LOGIN_FEATURES.map((item, index) => (
              <li key={item.id}>
                <span className="lgn-feature-icon">
                  <FeatureIcon kind={FEATURE_ICONS[index] ?? "users"} />
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <span>{item.desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="lgn-split-form-wrap" aria-label="Giriş formu">
        <div className="lgn-form-card">
          <header className="lgn-form-head">
            <h2>{LOGIN_FORM.title}</h2>
            <p>{LOGIN_FORM.subtitle}</p>
          </header>

          <form className="lgn-form" onSubmit={handleSubmit}>
            <label className="lgn-field">
              <span>{LOGIN_FORM.emailLabel}</span>
              <span className="lgn-input-wrap">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
                <input
                  type="email"
                  placeholder={LOGIN_FORM.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </span>
            </label>

            <label className="lgn-field">
              <span>{LOGIN_FORM.passwordLabel}</span>
              <span className="lgn-input-wrap">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
                <input
                  type="password"
                  placeholder={LOGIN_FORM.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button type="button" className="lgn-eye" aria-label="Şifreyi göster">
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </span>
            </label>

            {error ? <p className="lgn-error">{error}</p> : null}

            <div className="lgn-form-row">
              <label className="lgn-check">
                <input type="checkbox" />
                <span>{LOGIN_FORM.remember}</span>
              </label>
              <Link href="#" className="lgn-forgot">
                {LOGIN_FORM.forgot}
              </Link>
            </div>

            <button type="submit" className="lgn-submit" disabled={submitting}>
              {submitting ? "Giriş yapılıyor…" : LOGIN_FORM.submit}
            </button>
          </form>

          <p className="lgn-divider">
            <span>{LOGIN_FORM.divider}</span>
          </p>

          <aside className="lgn-demo">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 10v6M12 7h.01" />
            </svg>
            <div>
              <strong>{LOGIN_FORM.demoTitle}</strong>
              <p>
                E-posta: <span>{LOGIN_FORM.demoEmail}</span>
              </p>
              <p>
                Şifre: <span>{LOGIN_FORM.demoPassword}</span>
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
