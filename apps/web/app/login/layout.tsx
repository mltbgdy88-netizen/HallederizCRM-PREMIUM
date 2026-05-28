// @ts-nocheck
export default function LoginLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="auth-root" data-layout="auth">
      {children}
    </div>
  );
}

