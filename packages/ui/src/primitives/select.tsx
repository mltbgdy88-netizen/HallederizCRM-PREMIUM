import { forwardRef } from "react";
import type { ReactNode, SelectHTMLAttributes } from "react";

export type UiSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  children: ReactNode;
};

export const UiSelect = forwardRef<HTMLSelectElement, UiSelectProps>(function UiSelect({ className = "", children, ...rest }, ref) {
  return (
    <select ref={ref} className={["hz-ui-select", className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </select>
  );
});

export type UiSelectFieldProps = UiSelectProps & {
  label: string;
  id: string;
};

export function UiSelectField({ label, id, className = "", children, ...rest }: UiSelectFieldProps) {
  return (
    <div className="hz-ui-input-wrap">
      <label className="hz-ui-input-label" htmlFor={id}>
        {label}
      </label>
      <UiSelect id={id} className={className} {...rest}>
        {children}
      </UiSelect>
    </div>
  );
}
