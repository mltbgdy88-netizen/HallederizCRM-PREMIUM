"use client";

export type QuickOperationStepId = "customer" | "lines" | "preview" | "approval";

const STEPS: Array<{ id: QuickOperationStepId; label: string }> = [
  { id: "customer", label: "Cari seç" },
  { id: "lines", label: "Ürün / hizmet" },
  { id: "preview", label: "Önizle" },
  { id: "approval", label: "Onaya gönder" }
];

export function QuickOperationStepper({ activeStep }: { activeStep: QuickOperationStepId }) {
  const activeIndex = STEPS.findIndex((s) => s.id === activeStep);

  return (
    <nav className="hz-qop-stepper" aria-label="İşlem adımları">
      {STEPS.map((step, index) => {
        const isActive = step.id === activeStep;
        const isDone = index < activeIndex;
        return (
          <div
            key={step.id}
            className={["hz-qop-stepper-step", isActive ? "is-active" : "", isDone ? "is-done" : ""].filter(Boolean).join(" ")}
            aria-current={isActive ? "step" : undefined}
          >
            <span className="hz-qop-stepper-index" aria-hidden>
              {index + 1}
            </span>
            <span>{step.label}</span>
          </div>
        );
      })}
    </nav>
  );
}
