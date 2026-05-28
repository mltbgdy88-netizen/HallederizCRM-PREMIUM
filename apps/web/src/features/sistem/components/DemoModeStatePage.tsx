"use client";

import Link from "next/link";
import { useSistemStateReferenceData } from "@/features/sistem/hooks/use-sistem-state-reference-data";
import { SistemStateBackdrop } from "./SistemStateBackdrop";

export function DemoModeStatePage() {
  const {
    data: { demoModal: DEMO_MODAL }
  } = useSistemStateReferenceData();

  return (
    <div className="sys-state sys-state--demo">
      <SistemStateBackdrop />
      <div className="sys-overlay" role="presentation" />
      <dialog className="sys-demo-modal" open aria-labelledby="sys-demo-title">
        <div className="sys-demo-modal-head">
          <span className="sys-demo-logo" aria-hidden>
            <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth={1.5}>
              <path d="M12 3 4 7v6c0 5 4 9 8 10 4-1 8-5 8-10V7l-8-4z" />
            </svg>
          </span>
          <h2 id="sys-demo-title">{DEMO_MODAL.title}</h2>
        </div>
        <p className="sys-demo-lead">{DEMO_MODAL.lead}</p>
        <ul className="sys-demo-bullets">
          {DEMO_MODAL.bullets.map((item) => (
            <li key={item.id}>{item.text}</li>
          ))}
        </ul>
        <footer className="sys-demo-foot">
          <div className="sys-demo-toggle">
            <span>{DEMO_MODAL.toggleLabel}</span>
            <span className="sys-demo-toggle-pill">{DEMO_MODAL.toggleValue}</span>
          </div>
          <Link href="/dashboard" className="sys-demo-exit">
            {DEMO_MODAL.exit}
          </Link>
        </footer>
      </dialog>
    </div>
  );
}
