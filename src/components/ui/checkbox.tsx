import { forwardRef, useId } from "react";

import { cn } from "@/lib/utils/cn";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div>
        <div className="flex items-start gap-2.5">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className={cn(
              "mt-0.5 size-4 shrink-0 rounded-[4px] border border-neutral-300 accent-primary-500",
              "focus:outline-none focus:ring-4 focus:ring-primary-100",
              className,
            )}
            {...props}
          />
          <label
            htmlFor={inputId}
            className="cursor-pointer text-xs leading-relaxed text-neutral-500"
          >
            {label}
          </label>
        </div>
        {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      </div>
    );
  },
);
Checkbox.displayName = "Checkbox";
