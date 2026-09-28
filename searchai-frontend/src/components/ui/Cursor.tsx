import React from 'react';
import { cn } from '@/lib/utils';

interface CursorProps {
  variant?: 'block' | 'line' | 'underline';
  className?: string;
}

export const Cursor: React.FC<CursorProps> = ({ variant = 'block', className }) => {
  if (variant === 'line') {
    return (
      <span
        aria-hidden="true"
        className={cn(
          'inline-block w-[2px] h-[1.15em] bg-terminal-accent animate-cursor align-middle ml-0.5',
          className
        )}
      />
    );
  }

  if (variant === 'underline') {
    return (
      <span
        aria-hidden="true"
        className={cn(
          'inline-block w-[0.6em] h-[2px] bg-terminal-accent animate-cursor align-baseline ml-0.5',
          className
        )}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block w-[0.55em] h-[1.1em] bg-terminal-accent animate-cursor align-middle ml-0.5 opacity-90',
        className
      )}
    />
  );
};
