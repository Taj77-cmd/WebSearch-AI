import { useEffect } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { getTheme, saveTheme } from '@/lib/storage';

export function useTheme() {
  const { theme, setTheme } = useUIStore();

  useEffect(() => {
    const stored = getTheme();
    setTheme(stored);
  }, [setTheme]);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }

    saveTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const themes: ('dark' | 'light' | 'system')[] = ['dark', 'light', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return { theme, setTheme, toggleTheme };
}