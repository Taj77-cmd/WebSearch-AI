import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface GlitchTextProps {
  text: string;
  className?: string;
  glitchOnHover?: boolean;
  speed?: number;
}

const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#________01';

export const GlitchText: React.FC<GlitchTextProps> = ({
  text,
  className,
  glitchOnHover = true,
  speed = 30,
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const triggerGlitch = useCallback(() => {
    if (isGlitching) return;
    setIsGlitching(true);

    let iteration = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (index < iteration) {
              return text[index];
            }
            if (char === ' ') return ' ';
            return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(text);
        setIsGlitching(false);
      }

      iteration += 1 / 2;
    }, speed);
  }, [text, speed, isGlitching]);

  useEffect(() => {
    setDisplayText(text);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text]);

  return (
    <span
      className={cn(
        'inline-block font-mono select-none transition-colors duration-200 cursor-pointer',
        isGlitching && 'text-terminal-accent-secondary',
        className
      )}
      onMouseEnter={() => {
        if (glitchOnHover) triggerGlitch();
      }}
      onClick={triggerGlitch}
      title="Click to glitch"
    >
      {displayText}
    </span>
  );
};
