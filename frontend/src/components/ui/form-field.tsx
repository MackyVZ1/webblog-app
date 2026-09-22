import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
}
export function RequiredMark() {
  return (
    <>
      <span className="ml-1 text-[var(--accent)]" aria-hidden="true">*</span>
      <span className="sr-only"> (จำเป็น)</span>
    </>
  );
}

export function FormField({ label, htmlFor, children, required = false, hint, error, className }: FormFieldProps) {
  return (
    <div className={cn('grid gap-2', className)}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <label htmlFor={htmlFor} className="text-sm font-semibold">
          {label}{required && <RequiredMark />}
        </label>
        {hint && <span className="text-xs font-normal text-[var(--muted)]">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs font-medium text-red-700" role="alert">{error}</p>}
    </div>
  );
}
