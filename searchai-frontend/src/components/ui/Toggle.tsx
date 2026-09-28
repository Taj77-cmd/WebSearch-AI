import { forwardRef, type InputHTMLAttributes, useId } from 'react';
import { cn } from '@/lib/utils';

interface ToggleProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, label, description, id: providedId, ...props }, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;

    return (
      <div className="flex items-start gap-3">
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            className={cn(
              'peer h-5 w-5 cursor-pointer appearance-none rounded border-2',
              'border-terminal-border bg-terminal-surface',
              'checked:border-terminal-accent checked:bg-terminal-accent',
              'checked:after:content-[""] checked:after:absolute checked:after:left-1.5 checked:after:top-0.5',
              'checked:after:w-1 checked:after:h-2.5 checked:after:border-r-2 checked:after:border-b-2',
              'checked:after:border-terminal-text-inverse checked:after:rotate-45',
              'focus:outline-none focus:ring-2 focus:ring-terminal-accent/50',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className
            )}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="pt-1">
            {label && (
              <label htmlFor={id} className="font-mono text-sm text-terminal-text">
                {label}
              </label>
            )}
            {description && (
              <p className="font-mono text-xs text-terminal-text-dim mt-0.5">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';