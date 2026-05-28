// @ts-nocheck
import type { MouseEvent } from "react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const REF_SKIP_FALLBACK_ATTR = "data-ref-skip-fallback";
const REF_HANDLED_CLICK_ATTR = "data-ref-handled-click";

/** Next.js Link â€” undefined href uyarÄ±larÄ±nÄ± Ã¶nler; gerÃ§ek route varsa korunur. */
export function referenceHref(href?: string | null): string {
  const trimmed = href?.trim();
  return trimmed ? trimmed : "#";
}

export function markReferenceClickHandled(target: EventTarget | null): void {
  if (target instanceof HTMLElement) {
    target.setAttribute(REF_HANDLED_CLICK_ATTR, "1");
  }
}

type PushToast = (message: string) => void;

const LABEL_HREFS: ReadonlyArray<{ re: RegExp; href: string }> = [
  { re: /hÄ±zlÄ±\s*satÄ±ÅŸ/i, href: "/hizli-islem" },
  { re: /hÄ±zlÄ±\s*iÅŸlem/i, href: "/hizli-islem" },
  { re: /yeni\s+sipariÅŸ/i, href: "/siparisler/yeni" },
  { re: /yeni\s+teklif/i, href: "/teklifler/yeni" },
  { re: /yeni\s+(cari|mÃ¼ÅŸteri)/i, href: "/cariler/yeni" },
  { re: /yeni\s+fatura/i, href: "/faturalar/yeni" },
  { re: /yeni\s+tahsilat/i, href: "/tahsilatlar/yeni" },
  { re: /yeni\s+teslimat/i, href: "/teslimatlar/yeni" },
  { re: /yeni\s+iade/i, href: "/iadeler/yeni" },
  { re: /yeni\s+Ã¼rÃ¼n|stok\s*giriÅŸ/i, href: "/stok" },
  { re: /yeni\s+gÃ¶rev/i, href: "/gorevler" },
  { re: /yeni\s+belge/i, href: "/belgeler" },
  { re: /whatsapp|sohbet/i, href: "/whatsapp" },
  { re: /^onaylar?$|onay\s*merkezi/i, href: "/onaylar" },
  { re: /^raporlar?$|rapor\s*oluÅŸtur/i, href: "/raporlar" },
  { re: /^arÅŸiv$/i, href: "/arsiv" },
  { re: /ai\s*asistan|yapay\s*zeka/i, href: "/ai" },
  { re: /fabrika\s*sipariÅŸ/i, href: "/fabrikalar/siparis" },
  { re: /muhasebe/i, href: "/muhasebe" },
  { re: /ayarlar/i, href: "/ayarlar" }
];

function normalizeLabel(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

function inferHrefFromLabel(label: string, pathname: string): string | null {
  const normalized = normalizeLabel(label);
  if (!normalized) return null;

  for (const { re, href } of LABEL_HREFS) {
    if (re.test(normalized)) return href;
  }

  if (/tÃ¼mÃ¼nÃ¼\s*gÃ¶r|tÃ¼m\s*kayÄ±tlarÄ±/i.test(normalized)) {
    if (pathname.startsWith("/dashboard")) return "/siparisler";
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length >= 1) return `/${segments[0]}`;
  }

  if (/^liste$|^listeye\s*git$/i.test(normalized)) {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length >= 1) return `/${segments[0]}`;
  }

  return null;
}

function shouldSkipFallbackButton(button: HTMLButtonElement): boolean {
  if (button.hasAttribute(REF_SKIP_FALLBACK_ATTR)) return true;
  if (button.disabled) return true;
  if (button.closest("a[href]")) return true;
  if (button.type === "submit") return true;
  if (button.getAttribute("role") === "tab") return true;

  const className = button.className;
  if (typeof className === "string") {
    if (className.includes("-chip")) return true;
    if (className.includes("-tab")) return true;
    if (className.includes("-demo-close")) return true;
  }

  return false;
}

function runReferenceButtonFallback(
  button: HTMLButtonElement,
  router: AppRouterInstance,
  pushToast: PushToast,
  pathname: string
): void {
  if (!button.isConnected) return;
  if (shouldSkipFallbackButton(button)) return;
  if (button.getAttribute(REF_HANDLED_CLICK_ATTR) === "1") {
    button.removeAttribute(REF_HANDLED_CLICK_ATTR);
    return;
  }

  const explicitHref = button.getAttribute("data-href");
  if (explicitHref) {
    router.push(explicitHref);
    return;
  }

  const explicitToast = button.getAttribute("data-demo-toast");
  const label = normalizeLabel(
    button.getAttribute("aria-label")?.replace(/\s*bilgisi$/i, "") ??
      button.textContent ??
      "Ä°ÅŸlem"
  );

  if (explicitToast) {
    pushToast(explicitToast);
    return;
  }

  const href = inferHrefFromLabel(label, pathname);
  if (href) {
    router.push(href);
    return;
  }

  pushToast(`${label} â€” demo Ã¶nizleme; canlÄ± iÅŸlem onay akÄ±ÅŸÄ±yla yapÄ±lÄ±r.`);
}

export function handleReferencePageClick(
  event: MouseEvent<HTMLElement>,
  router: AppRouterInstance,
  pushToast: PushToast,
  pathname: string
): void {
  if (event.defaultPrevented) return;

  const target = event.target;
  if (!(target instanceof Element)) return;

  const link = target.closest("a[href]");
  if (link) {
    const href = link.getAttribute("href");
    if (href && href !== "#" && !href.startsWith("javascript:")) return;
  }

  const button = target.closest("button");
  if (!button || !button.closest("main.ref-page")) return;
  if (shouldSkipFallbackButton(button)) return;

  queueMicrotask(() => {
    runReferenceButtonFallback(button, router, pushToast, pathname);
  });
}

