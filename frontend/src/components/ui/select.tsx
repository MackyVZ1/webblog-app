import * as React from 'react';
import { cn } from '../../lib/utils';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, required, ...props }, ref) => (
    <select
      ref={ref}
      required={required}
      aria-required={required || undefined}
      className={cn('h-11 w-full rounded-xl border border-[var(--line)] bg-white px-4 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand)_15%,transparent)]', className)}
      {...props}
    />
  ),
);
Select.displayName = 'Select';
