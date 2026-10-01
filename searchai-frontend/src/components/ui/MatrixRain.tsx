import React, { useEffect, useRef } from 'react';

interface MatrixRainProps {
  opacity?: number;
  className?: string;
}

export const MatrixRain: React.FC<MatrixRainProps> = ({ opacity = 0.15, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const state = {
      width: window.innerWidth,
      height: window.innerHeight,
      columns: 0,
      drops: [] as number[],
    };

    const fontSize = 14;

    // Characters: Katakana, Latin, Numbers
    const chars = '0123456789ABCDEF01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

    /** Reinitialise the canvas size and drop columns. */
    const init = () => {
      state.width = canvas.width = window.innerWidth;
      state.height = canvas.height = window.innerHeight;
      state.columns = Math.floor(state.width / fontSize);

      // Stagger drop start positions so they don't all begin at row 0
      state.drops = Array.from({ length: state.columns }, () =>
        Math.floor(Math.random() * -(state.height / fontSize))
      );
    };

    init();

    const handleResize = () => {
      init();
    };
    window.addEventListener('resize', handleResize);

    let lastTime = 0;
    const fps = 24;
    const interval = 1000 / fps;

    const draw = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(draw);

      const delta = currentTime - lastTime;
      if (delta < interval) return;
      lastTime = currentTime - (delta % interval);

      const { width, height, drops } = state;

      // Fade the previous frame – creates the trailing tail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#3fb950';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity }}
    />
  );
};
