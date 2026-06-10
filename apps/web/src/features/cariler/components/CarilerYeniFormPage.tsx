"use client";

import { useCarilerYeniFormReferenceData } from "@/features/cariler/hooks/use-cariler-yeni-form-reference-data";

function FieldIcon({ icon }: { icon: string }) {
  const props = {
    className: "cyf-field-icon",
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    "aria-hidden": true as const
  };
  if (icon === "building") {
    return (
      <svg {...props}>
        <path d="M4 21V5a1 1 0 0 1 1-1h5v17M14 21V9h5a1 1 0 0 1 1 1v11M9 9h1M9 13h1M9 17h1" />
      </svg>
    );
  }
  if (icon === "id") {
    return (
      <svg {...props}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M7 10h4M7 14h6" />
      </svg>
    );
  }
  if (icon === "pin") {
    return (
      <svg {...props}>
        <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }
  if (icon === "person") {
    return (
      <svg {...props}>
        <circle cx="12" cy="8" r="3" />
        <path d="M4 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      </svg>
    );
  }
  if (icon === "phone") {
    return (
      <svg {...props}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function ActionIcon({ kind }: { kind: "save" | "cancel" }) {
  const props = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    "aria-hidden": true as const
  };
  if (kind === "save") {
    return (
      <svg {...props}>
        <path d="M5 12l4 4L19 6" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function CarilerYeniFormPage() {
  const {
    data: {
      form: CYF_FORM,
      fields: CYF_FIELDS,
      location: CYF_LOCATION,
      extraFields: CYF_EXTRA_FIELDS,
      actions: CYF_ACTIONS
    }
  } = useCarilerYeniFormReferenceData();

  return (
    <div className="cyf-home">
      <div className="cyf-card">
        <header className="cyf-head">
          <span className="cyf-head-icon" aria-hidden>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="10" cy="8" r="3.5" />
              <path d="M4 20c0-3.5 2.8-6.5 6.5-6.5" />
              <path d="M19 8v6M16 11h6" />
            </svg>
          </span>
          <div>
            <h1>{CYF_FORM.title}</h1>
            <p>{CYF_FORM.subtitle}</p>
          </div>
        </header>

        <form className="cyf-form" onSubmit={(e) => e.preventDefault()}>
          {CYF_FIELDS.map((field) => (
            <label key={field.id} className="cyf-field">
              <span>{field.label}</span>
              <span className="cyf-input-wrap">
                <input type="text" readOnly placeholder={field.placeholder} aria-label={field.label} />
                <FieldIcon icon={field.icon} />
              </span>
            </label>
          ))}

          <div className="cyf-row-2">
            <label className="cyf-field">
              <span>{CYF_LOCATION.ilLabel}</span>
              <span className="cyf-input-wrap cyf-input-wrap--select">
                <select defaultValue="" aria-label={CYF_LOCATION.ilLabel}>
                  <option value="" disabled>
                    {CYF_LOCATION.ilPlaceholder}
                  </option>
                </select>
                <svg className="cyf-chevron" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </label>
            <label className="cyf-field">
              <span>{CYF_LOCATION.ilceLabel}</span>
              <span className="cyf-input-wrap cyf-input-wrap--select">
                <select defaultValue="" aria-label={CYF_LOCATION.ilceLabel}>
                  <option value="" disabled>
                    {CYF_LOCATION.ilcePlaceholder}
                  </option>
                </select>
                <svg className="cyf-chevron" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </label>
          </div>

          {CYF_EXTRA_FIELDS.map((field) => (
            <label key={field.id} className={`cyf-field${field.type === "textarea" ? " cyf-field--area" : ""}`}>
              <span>{field.label}</span>
              <span className="cyf-input-wrap">
                {field.type === "textarea" ? (
                  <textarea readOnly placeholder={field.placeholder} rows={3} aria-label={field.label} />
                ) : (
                  <input type="text" readOnly placeholder={field.placeholder} aria-label={field.label} />
                )}
                <FieldIcon icon={field.icon} />
              </span>
            </label>
          ))}

          <div className="cyf-actions">
            <button type="button" className="cyf-btn cyf-btn--primary">
              <ActionIcon kind="save" />
              {CYF_ACTIONS.save}
            </button>
            <a href="/cariler" className="cyf-btn cyf-btn--outline">
              <ActionIcon kind="cancel" />
              {CYF_ACTIONS.cancel}
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
