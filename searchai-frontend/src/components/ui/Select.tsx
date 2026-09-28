import { forwardRef, type SelectHTMLAttributes, useId } from 'react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, id: providedId, ...props }, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block font-mono text-xs text-terminal-text-secondary mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            'w-full px-3 py-2 font-mono text-sm bg-terminal-surface border rounded-lg transition-all duration-200 appearance-none',
            'text-terminal-text',
            'focus:outline-none focus:border-terminal-accent focus:ring-2 focus:ring-terminal-accent/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-terminal-error focus:border-terminal-error focus:ring-terminal-error/20',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={errorId} className="mt-1.5 font-mono text-xs text-terminal-error" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="mt-1.5 font-mono text-xs text-terminal-text-dim">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';