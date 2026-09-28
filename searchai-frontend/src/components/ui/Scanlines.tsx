import React from 'react';

interface ScanlinesProps {
  opacity?: number;
  className?: string;
}

export const Scanlines: React.FC<ScanlinesProps> = ({ opacity = 0.03, className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-50 overflow-hidden ${className}`}
      style={{
        background: `repeating-linear-gradient(
          0deg,
          rgba(0, 0, 0, ${opacity * 5}),
          rgba(0, 0, 0, ${opacity * 5}) 1px,
          transparent 1px,
          transparent 3px
        )`,
      }}
    />
  );
};
