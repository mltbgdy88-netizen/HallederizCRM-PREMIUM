"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export type DetailReferenceShellProps = {
  children: ReactNode;
  pageClassName?: string;
  shellClassName?: string;
  pageHookClassName?: string;
};

export type DetailReferenceHeaderProps = {
  eyebrow?: string;
  title: string;
  meta?: string;
  headerClassName?: string;
  mainClassName?: string;
  eyebrowClassName?: string;
  metaClassName?: string;
  actions?: ReactNode;
};

export type DetailKpiStripProps = {
  children: ReactNode;
  className?: string;
  stickyClassName?: string;
  ariaLabel?: string;
  sticky?: boolean;
};

export type DetailDemoBandProps = {
  children: ReactNode;
  className?: string;
};

export type DetailWorkspaceProps = {
  main: ReactNode;
  side?: ReactNode;
  layoutClassName?: string;
  mainClassName?: string;
  sideClassName?: string;
};

export type DetailSideCardProps = {
  title: string;
  children: ReactNode;
  className?: string;
  headClassName?: string;
  ariaLabel?: string;
  headExtra?: ReactNode;
};

export type DetailLoadingStateProps = {
  title: string;
  message: string;
  stateClassName?: string;
  spinnerClassName?: string;
  titleClassName?: string;
  messageClassName?: string;
};

export type DetailNotFoundStateProps = {
  title: string;
  message: string;
  backHref: string;
  backLabel: string;
  stateClassName?: string;
  linkClassName?: string;
  titleClassName?: string;
  messageClassName?: string;
};

export function DetailReferenceShell({
  children,
  pageClassName = "tdf-page",
  shellClassName = "tdf-shell",
  pageHookClassName = "hz-tahsilatlar-detail-page"
}: DetailReferenceShellProps) {
  return (
    <section className={[pageHookClassName, pageClassName].filter(Boolean).join(" ")}>
      <div className={shellClassName}>{children}</div>
    </section>
  );
}

export function DetailReferenceHeader({
  eyebrow,
  title,
  meta,
  headerClassName = "tdf-header",
  mainClassName = "tdf-header__main",
  eyebrowClassName = "tdf-header__eyebrow",
  metaClassName = "tdf-header__meta",
  actions
}: DetailReferenceHeaderProps) {
  return (
    <header className={headerClassName}>
      <div className={mainClassName}>
        {eyebrow ? <p className={eyebrowClassName}>{eyebrow}</p> : null}
        <h1>{title}</h1>
        {meta ? <p className={metaClassName}>{meta}</p> : null}
      </div>
      {actions}
    </header>
  );
}

export function DetailKpiStrip({
  children,
  className = "tdf-kpi-strip",
  stickyClassName = "tdf-sticky-summary",
  ariaLabel,
  sticky = true
}: DetailKpiStripProps) {
  const strip = (
    <section className={className} aria-label={ariaLabel}>
      {children}
    </section>
  );

  if (!sticky) {
    return strip;
  }

  return <div className={stickyClassName}>{strip}</div>;
}

export function DetailDemoBand({ children, className = "tdf-demo-band" }: DetailDemoBandProps) {
  return (
    <p className={className} role="status">
      {children}
    </p>
  );
}

export function DetailWorkspace({
  main,
  side,
  layoutClassName = "tdf-layout",
  mainClassName = "tdf-main",
  sideClassName = "tdf-side"
}: DetailWorkspaceProps) {
  return (
    <main className={layoutClassName}>
      <section className={mainClassName}>{main}</section>
      {side ? <aside className={sideClassName}>{side}</aside> : null}
    </main>
  );
}

export function DetailSideCard({
  title,
  children,
  className = "tdf-side-card",
  headClassName = "tdf-side-card__head",
  ariaLabel,
  headExtra
}: DetailSideCardProps) {
  return (
    <section className={className} aria-label={ariaLabel}>
      <header className={headClassName}>
        <h3>{title}</h3>
        {headExtra}
      </header>
      {children}
    </section>
  );
}

export function DetailLoadingState({
  title,
  message,
  stateClassName = "tdf-state",
  spinnerClassName = "tdf-state__spinner",
  titleClassName,
  messageClassName
}: DetailLoadingStateProps) {
  return (
    <div className={stateClassName} role="status" aria-live="polite">
      <div className={spinnerClassName} aria-hidden />
      <h2 className={titleClassName}>{title}</h2>
      <p className={messageClassName}>{message}</p>
    </div>
  );
}

export function DetailNotFoundState({
  title,
  message,
  backHref,
  backLabel,
  stateClassName = "tdf-state",
  linkClassName = "tdf-state__link",
  titleClassName,
  messageClassName
}: DetailNotFoundStateProps) {
  return (
    <div className={stateClassName} role="alert">
      <h2 className={titleClassName}>{title}</h2>
      <p className={messageClassName}>{message}</p>
      <Link href={backHref} className={linkClassName}>
        {backLabel}
      </Link>
    </div>
  );
}
