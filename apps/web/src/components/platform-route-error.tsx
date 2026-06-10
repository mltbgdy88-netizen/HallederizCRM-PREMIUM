"use client";

type PlatformRouteErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
  classPrefix?: string;
};

export function PlatformRouteError({ reset, classPrefix = "hz-route-error" }: PlatformRouteErrorProps) {
  return (
    <div className={`${classPrefix} ${classPrefix}--safe`} role="alert">
      <h2 className={`${classPrefix}-title`}>Bu ekran şu anda yüklenemedi.</h2>
      <p className={`${classPrefix}-text`}>Lütfen tekrar deneyin.</p>
      <button type="button" className={`${classPrefix}-retry`} onClick={() => reset()}>
        Tekrar dene
      </button>
    </div>
  );
}

