import { forwardRef, type InputHTMLAttributes, useId } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id: providedId, ...props }, ref) => {
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
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full px-4 py-3 font-mono text-base bg-terminal-surface border rounded-lg transition-all duration-200',
            'text-terminal-text placeholder-terminal-text-dim',
            'focus:outline-none focus:border-terminal-accent focus:ring-2 focus:ring-terminal-accent/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-terminal-error focus:border-terminal-error focus:ring-terminal-error/20',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          {...props}
        />
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

Input.displayName = 'Input';