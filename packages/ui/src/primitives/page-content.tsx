import type { HTMLAttributes, ReactNode } from "react";

export type PageContentProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /**
   * `true` (varsayılan): `platform-content` sınıfı eklenir; mevcut shell `:has(...)` kuralları korunur.
   * `false`: yalnızca `hz-page-content--standalone` (iç içe layout testleri veya shell dışı kullanım).
   */
  asPlatformRoot?: boolean;
};

/**
 * Ana çalışma alanı: max-width 1604px, yatay ortalı, sütun flex (min-height:0 zinciri için).
 */
export function PageContent({ children, className = "", asPlatformRoot = true, ...rest }: PageContentProps) {
  const rootClass = asPlatformRoot ? "platform-content hz-page-content" : "hz-page-content--standalone";
  return (
    <div className={[rootClass, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}
