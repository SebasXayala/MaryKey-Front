"use client";

import { forwardRef, useId } from "react";

import { cn } from "@/lib/utils/cn";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, rows = 3, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const describedBy = error
      ? `${textareaId}-error`
      : hint
        ? `${textareaId}-hint`
        : undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="label-field mb-2">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn(
            "w-full rounded-field border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 shadow-field",
            "placeholder:text-neutral-400",
            "transition-colors focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100",
            "disabled:cursor-not-allowed disabled:bg-neutral-50",
            error && "border-danger focus:border-danger focus:ring-danger/15",
            className,
          )}
          {...props}
        />

        {error ? (
          <p id={`${textareaId}-error`} className="mt-1.5 text-xs text-danger">
            {error}
          </p>
        ) : hint ? (
          <p id={`${textareaId}-hint`} className="mt-1.5 text-xs text-neutral-400">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
