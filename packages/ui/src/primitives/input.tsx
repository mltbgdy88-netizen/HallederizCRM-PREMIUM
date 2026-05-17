import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

export type UiInputProps = InputHTMLAttributes<HTMLInputElement>;

export const UiInput = forwardRef<HTMLInputElement, UiInputProps>(function UiInput({ className = "", ...rest }, ref) {
  return <input ref={ref} className={["hz-ui-input", className].filter(Boolean).join(" ")} {...rest} />;
});

export type UiInputFieldProps = UiInputProps & {
  label: string;
  id: string;
  hint?: ReactNode;
};

export function UiInputField({ label, id, hint, className = "", ...rest }: UiInputFieldProps) {
  return (
    <div className="hz-ui-input-wrap">
      <label className="hz-ui-input-label" htmlFor={id}>
        {label}
      </label>
      <UiInput id={id} className={className} {...rest} />
      {hint ? <div className="hz-ui-input-hint">{hint}</div> : null}
    </div>
  );
}
